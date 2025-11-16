import { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonDatetime,
  IonList,
  IonItem,
  IonBadge,
  useIonViewDidEnter
} from '@ionic/react';
import { shareOutline } from 'ionicons/icons';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import html2canvas from 'html2canvas';
import { Toast } from '@capacitor/toast';
import { SqliteServiceContext, StorageServiceContext } from '../App';
import { Task, TaskStatus } from '../models/Task';
import './Statistics.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DayStats {
  date: string;
  count: number;
}

const Review: React.FC = () => {
  const history = useHistory();
  const sqliteServ = useContext(SqliteServiceContext);
  const storageServ = useContext(StorageServiceContext);
  const statsContainerRef = useRef<HTMLDivElement>(null);

  const taskClicked = (task: Task) => {
    history.push({
      pathname: '/task',
      state: { task }
    });
  };

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<string>('charts');
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalDaysTracked, setTotalDaysTracked] = useState(0);
  const [last7Days, setLast7Days] = useState(0);
  const [last30Days, setLast30Days] = useState(0);
  const [fourMonthData, setFourMonthData] = useState<DayStats[]>([]);
  const [chartData, setChartData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });

  // Calendar view states
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<Task[]>([]);
  const [completedCountByDate, setCompletedCountByDate] = useState<{ [key: string]: number }>({});

  const reloadTasksForSelectedDate = async () => {
    try {
      const dbName = storageServ.getDatabaseName();
      const isConn = await sqliteServ.isConnection(dbName, false);

      // If no connection, initialize the database
      if (!isConn) {
        await storageServ.initializeDatabase();
      }

      const tasks = await storageServ.getTasksByDate(selectedDate);
      setTasksForSelectedDate(tasks);
    } catch {
      // Error handled silently
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useIonViewDidEnter(() => {
    loadData();
    reloadTasksForSelectedDate();
  });

  const loadData = async () => {
    // Load statistics
    loadStatistics();
  };

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const dbName = storageServ.getDatabaseName();
      const isConn = await sqliteServ.isConnection(dbName, false);

      // If no connection, initialize the database
      if (!isConn) {
        await storageServ.initializeDatabase();
      }

      // Get all objectives
      const allTasks = await storageServ.getTasks();

      // Filter completed objectives
      const completedTasks = allTasks.filter(
        obj => obj.status === TaskStatus.Done
      );

      // Calculate total
      setTotalCompleted(completedTasks.length);

      // Calculate days tracked from the first objective
      if (allTasks.length > 0) {
        const dates = allTasks.map(obj => new Date(obj.creation_date));
        const firstDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setTotalDaysTracked(daysDiff);
      } else {
        setTotalDaysTracked(0);
      }

      // Calculate date ranges
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      // Count last 7 days
      const last7 = completedTasks.filter(obj => {
        const objDate = new Date(obj.creation_date);
        return objDate >= sevenDaysAgo;
      }).length;
      setLast7Days(last7);

      // Count last 30 days
      const last30 = completedTasks.filter(obj => {
        const objDate = new Date(obj.creation_date);
        return objDate >= thirtyDaysAgo;
      }).length;
      setLast30Days(last30);

      // Generate heatmap data for last 4 months
      const fourMonth = generateFourMonthHeatmapData(completedTasks);
      setFourMonthData(fourMonth);

      // Generate chart data for the last 10 days
      const chart = generateChartData(completedTasks, 10);
      setChartData(chart);

      // Create completed count by date map for calendar styling
      const countByDate: { [key: string]: number } = {};
      completedTasks.forEach(obj => {
        const date = obj.creation_date;
        countByDate[date] = (countByDate[date] || 0) + 1;
      });
      setCompletedCountByDate(countByDate);

      // Load today's tasks by default
      const todayDate = getTodayDate();
      const todayTasks = await storageServ.getTasksByDate(todayDate);
      setTasksForSelectedDate(todayTasks);

    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (completedTasks: Task[], days: number): { labels: string[], data: number[] } => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (days - 1)); // Include today

    // Create a map of date -> count
    const countByDate: { [key: string]: number } = {};

    completedTasks.forEach(obj => {
      const date = obj.creation_date;
      countByDate[date] = (countByDate[date] || 0) + 1;
    });

    // Generate array of all days in the range
    const labels: string[] = [];
    const data: number[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= today) {
      const dateStr = formatDate(currentDate);
      // Format label as MM/DD
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      labels.push(`${month}/${day}`);
      data.push(countByDate[dateStr] || 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { labels, data };
  };

  const generateFourMonthHeatmapData = (completedTasks: Task[]): DayStats[] => {
    const today = new Date();
    const fourMonthsAgo = new Date(today);
    fourMonthsAgo.setDate(today.getDate() - 119); // 120 days including today (approximately 4 months)

    // Create a map of date -> count
    const countByDate: { [key: string]: number } = {};

    completedTasks.forEach(obj => {
      const date = obj.creation_date;
      countByDate[date] = (countByDate[date] || 0) + 1;
    });

    // Generate array of all days in the past 120 days
    const heatmap: DayStats[] = [];
    const currentDate = new Date(fourMonthsAgo);

    while (currentDate <= today) {
      const dateStr = formatDate(currentDate);
      heatmap.push({
        date: dateStr,
        count: countByDate[dateStr] || 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return heatmap;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getHeatmapColor = (count: number): string => {
    if (count === 0) return 'heatmap-empty';
    if (count === 1) return 'heatmap-low';
    if (count === 2) return 'heatmap-medium';
    return 'heatmap-high'; // 3 or more
  };

  const handleDateChange = async (e: any) => {
    const selectedDateValue = e.detail.value;
    if (!selectedDateValue) return;

    // Extract date in YYYY-MM-DD format
    const date = new Date(selectedDateValue);
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);

    // Load tasks for this date
    try {
      const dbName = storageServ.getDatabaseName();
      const isConn = await sqliteServ.isConnection(dbName, false);

      // If no connection, initialize the database
      if (!isConn) {
        await storageServ.initializeDatabase();
      }

      const tasks = await storageServ.getTasksByDate(dateStr);
      setTasksForSelectedDate(tasks);
    } catch {
      // Error handled silently
    }
  };

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case TaskStatus.Open:
        return 'Open';
      case TaskStatus.Done:
        return 'Done';
      case TaskStatus.Overdue:
        return 'Overdue';
      default:
        return `Unknown (${status})`;
    }
  };

  const getStatusColor = (status: number): string => {
    switch (status) {
      case TaskStatus.Open:
        return 'primary';
      case TaskStatus.Done:
        return 'success';
      case TaskStatus.Overdue:
        return 'danger';
      default:
        return 'medium';
    }
  };

  const renderFourMonthHeatmap = () => {
    // Organize data into weeks (columns) with 7 days (rows) each
    const weeks: (DayStats | null)[][] = [];

    // Start from the first day and pad to Sunday
    if (fourMonthData.length === 0) return null;

    const firstDate = new Date(fourMonthData[0].date);
    const firstDayOfWeek = firstDate.getDay(); // 0 = Sunday, 6 = Saturday

    let currentWeek: (DayStats | null)[] = new Array(7).fill(null);

    // Fill initial padding
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek[i] = null;
    }

    let dayIndex = 0;
    let weekDayIndex = firstDayOfWeek;

    while (dayIndex < fourMonthData.length) {
      currentWeek[weekDayIndex] = fourMonthData[dayIndex];
      weekDayIndex++;
      dayIndex++;

      if (weekDayIndex === 7) {
        weeks.push([...currentWeek]);
        currentWeek = new Array(7).fill(null);
        weekDayIndex = 0;
      }
    }

    // Push remaining days
    if (weekDayIndex > 0) {
      weeks.push([...currentWeek]);
    }

    // Generate month labels
    const monthLabels: { month: string; weekIndex: number }[] = [];
    let currentMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDayInWeek = week.find(day => day !== null);
      if (firstDayInWeek) {
        const date = new Date(firstDayInWeek.date);
        const month = date.getMonth();

        if (month !== currentMonth) {
          currentMonth = month;
          monthLabels.push({
            month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month],
            weekIndex
          });
        }
      }
    });

    return (
      <div className="github-heatmap-container">
        <div className="github-heatmap-months" style={{ height: '15px' }}>
          {monthLabels.map((label, idx) => (
            <span
              key={idx}
              className="github-month-label"
              style={{ left: `${label.weekIndex * 13}px` }}
            >
              {label.month}
            </span>
          ))}
        </div>
        <div className="github-heatmap-graph">
          <div className="github-heatmap-days">
            <span></span>
            <span>Mon</span>
            <span></span>
            <span>Wed</span>
            <span></span>
            <span>Fri</span>
            <span></span>
          </div>
          <div className="github-heatmap-grid">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="github-week-column">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`github-day-cell ${day ? getHeatmapColor(day.count) : 'github-empty'}`}
                    title={day ? `${day.date}: ${day.count} goal(s) completed` : ''}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="github-heatmap-legend">
          <span>Less</span>
          <div className="github-day-cell heatmap-empty" />
          <div className="github-day-cell heatmap-low" />
          <div className="github-day-cell heatmap-medium" />
          <div className="github-day-cell heatmap-high" />
          <span>More</span>
        </div>
      </div>
    );
  };

  const handleShare = async () => {
    if (!statsContainerRef.current) return;

    try {
      // Find all scrollable containers and temporarily remove overflow
      const heatmapContainers = statsContainerRef.current.querySelectorAll('.github-heatmap-container');
      const originalOverflows: string[] = [];

      heatmapContainers.forEach((container, index) => {
        const htmlElement = container as HTMLElement;
        originalOverflows[index] = htmlElement.style.overflow;
        htmlElement.style.overflow = 'visible';
      });

      // Capture the stats container as an image
      const canvas = await html2canvas(statsContainerRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: statsContainerRef.current.scrollWidth,
        windowHeight: statsContainerRef.current.scrollHeight,
      });

      // Restore original overflow
      heatmapContainers.forEach((container, index) => {
        const htmlElement = container as HTMLElement;
        htmlElement.style.overflow = originalOverflows[index];
      });

      // Convert canvas to base64
      const base64Image = canvas.toDataURL('image/png');
      const base64Data = base64Image.split(',')[1]; // Remove data:image/png;base64, prefix

      // Save file to filesystem
      const fileName = `stats-${Date.now()}.png`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      // Share the file
      await Share.share({
        title: 'My Goal Achievements',
        text: `Total: ${totalCompleted} goals | Last 7 days: ${last7Days} | Last 30 days: ${last30Days}`,
        files: [savedFile.uri],
        dialogTitle: 'Share Your Progress'
      });

      // Clean up the temporary file
      await Filesystem.deleteFile({
        path: fileName,
        directory: Directory.Cache
      });

      Toast.show({
        text: 'Stats shared successfully!',
        duration: 'short'
      });
    } catch (error) {
      Toast.show({
        text: `Error sharing stats: ${error}`,
        duration: 'long'
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonSegment value={selectedView} onIonChange={(e) => setSelectedView(e.detail.value as string)}>
            <IonSegmentButton value="charts">
              <IonLabel>Charts</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="calendar">
              <IonLabel>Calendar</IonLabel>
            </IonSegmentButton>
          </IonSegment>
          <IonButtons slot="end">
            <IonButton onClick={handleShare} disabled={loading}>
              <IonIcon icon={shareOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner />
          </div>
        ) : (
          <div ref={statsContainerRef}>
            {/* Summary stats - always visible */}
            {/* Charts View - Plot and Heatmap */}
            {selectedView === 'charts' && (
              <>
                <IonGrid>
                  <IonRow>
                    <IonCol size="4">
                      <IonCard style={{ margin: '0.25rem' }}>
                        <IonCardContent style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>
                            Total
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
                            {totalCompleted}
                          </div>
                          {totalDaysTracked > 0 && (
                            <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.25rem' }}>
                              {(totalCompleted / totalDaysTracked).toFixed(1)}/day
                            </div>
                          )}
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                    <IonCol size="4">
                      <IonCard style={{ margin: '0.25rem' }}>
                        <IonCardContent style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>
                            7 Days
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--ion-color-success)' }}>
                            {last7Days}
                          </div>
                          <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.25rem' }}>
                            {(last7Days / 7).toFixed(1)}/day
                          </div>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                    <IonCol size="4">
                      <IonCard style={{ margin: '0.25rem' }}>
                        <IonCardContent style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>
                            30 Days
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--ion-color-secondary)' }}>
                            {last30Days}
                          </div>
                          <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.25rem' }}>
                            {(last30Days / 30).toFixed(1)}/day
                          </div>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  </IonRow>
                </IonGrid>

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>10 Days performance</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div>
                      <Line
                        data={{
                          labels: chartData.labels,
                          datasets: [{
                            label: 'Tasks Completed',
                            data: chartData.data,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            fill: true,
                            tension: 0.4
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: true,
                          plugins: {
                            legend: {
                              display: false
                            },
                            tooltip: {
                              callbacks: {
                                title: (context) => {
                                  return chartData.labels[context[0].dataIndex];
                                },
                                label: (context) => {
                                  return `${context.parsed.y} task${context.parsed.y !== 1 ? 's' : ''}`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                stepSize: 1
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>4 Months performance</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {renderFourMonthHeatmap()}
                  </IonCardContent>
                </IonCard>
              </>
            )}

            {/* Calendar View */}
            {selectedView === 'calendar' && (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Task Calendar</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonDatetime
                    presentation="date"
                    value={selectedDate}
                    onIonChange={handleDateChange}
                    highlightedDates={(isoString) => {
                      const date = new Date(isoString);
                      const dateStr = formatDate(date);
                      const count = completedCountByDate[dateStr] || 0;

                      if (count === 0) return undefined;

                      // Return color based on completed count (like heatmap)
                      if (count === 1) {
                        return {
                          textColor: '#000000',
                          backgroundColor: '#9be9a8'
                        };
                      } else if (count === 2) {
                        return {
                          textColor: '#ffffff',
                          backgroundColor: '#40c463'
                        };
                      } else {
                        return {
                          textColor: '#ffffff',
                          backgroundColor: '#30a14e'
                        };
                      }
                    }}
                  />

                  {selectedDate && tasksForSelectedDate.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <h3>Tasks for {selectedDate}</h3>
                      <IonList>
                        {tasksForSelectedDate.map(task => (
                          <IonItem key={task.id} button={true} onClick={() => taskClicked(task)}>
                            <IonLabel>
                              <h3>{task.title}</h3>
                              {task.description && <p>{task.description}</p>}
                            </IonLabel>
                            <IonBadge slot="end" color={getStatusColor(task.status)}>
                              {getStatusLabel(task.status)}
                            </IonBadge>
                          </IonItem>
                        ))}
                      </IonList>
                    </div>
                  )}

                  {selectedDate && tasksForSelectedDate.length === 0 && (
                    <div style={{ marginTop: '1rem', textAlign: 'center', opacity: 0.6 }}>
                      <p>No tasks for {selectedDate}</p>
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            )}
          </div>
        )}

      </IonContent>
    </IonPage>
  );
};

export default Review;
