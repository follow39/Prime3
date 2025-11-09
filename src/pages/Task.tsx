import { IonContent, IonHeader, IonButtons, IonBackButton, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonFooter, IonAlert, useIonRouter } from '@ionic/react';
import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Task as TaskModel, TaskStatus } from '../models/Task';
import { StorageServiceContext } from '../App';
import TimeLeft from '../services/timeLeftService';
import PreferencesService from '../services/preferencesService';

const Task: React.FC = () => {
    const location = useLocation<{ task: TaskModel }>();
    const router = useIonRouter();
    const storageServ = useContext(StorageServiceContext);

    const [task, setTask] = useState<TaskModel | null>(null);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [headerTimeLeft, setHeaderTimeLeft] = useState<string>('');
    const [earliestEndTime, setEarliestEndTime] = useState<string>('22:00');
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

    useEffect(() => {
        if (location.state?.task) {
            const taskData = location.state.task;
            setTask(taskData);
            setTitle(taskData.title);
            setDescription(taskData.description || '');
        }
    }, [location.state]);

    // Load earliest end time from preferences
    useEffect(() => {
        const loadEarliestEndTime = async () => {
            const time = await PreferencesService.getEarliestEndTime();
            setEarliestEndTime(time);
        };
        loadEarliestEndTime();
    }, []);

    // Update header time left periodically
    useEffect(() => {
        const updateHeaderTime = () => {
            const timeLeftResult = TimeLeft(earliestEndTime);
            setHeaderTimeLeft(timeLeftResult);
        };

        if (earliestEndTime) {
            updateHeaderTime();
            const interval = setInterval(updateHeaderTime, 1000);
            return () => {
                clearInterval(interval);
            };
        }
    }, [earliestEndTime]);

    const handleSave = async () => {
        if (!title.trim()) {
            return;
        }

        if (!task) return;

        try {
            const updatedObjective: ObjectiveModel = {
                ...task,
                title: title.trim(),
                description: description.trim()
            };

            await storageServ.updateObjective(updatedObjective);
            setObjective(updatedObjective);
            setIsEditing(false);
        } catch (error) {
            const msg = `Error updating task: ${error}`;
            console.error(msg);
        }
    };

    const handleDoneClick = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmDone = async () => {
        if (!task) return;

        try {
            const updatedObjective: ObjectiveModel = {
                ...task,
                status: TaskStatus.Done
            };

            await storageServ.updateObjective(updatedObjective);
            setObjective(updatedObjective);

            // Navigate back to home page
            router.push('/home', 'back');
        } catch (error) {
            const msg = `Error updating task status: ${error}`;
            console.error(msg);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
        }
        setIsEditing(false);
    };

    if (!task) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot='start'>
                            <IonBackButton defaultHref='/home' />
                        </IonButtons>
                        <IonTitle color="danger">{headerTimeLeft}</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <p>No task data available</p>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot='start'>
                        <IonBackButton defaultHref='/home' />
                    </IonButtons>
                    <IonTitle color="danger">{headerTimeLeft}</IonTitle>
                    <IonButtons slot='end'>
                        {!isEditing && (
                            <IonButton onClick={handleEdit}>
                                Edit
                            </IonButton>
                        )}
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {isEditing ? (
                    <>
                        <IonItem>
                            <IonLabel position="stacked">Title *</IonLabel>
                            <IonInput
                                value={title}
                                onIonInput={(e) => setTitle(e.detail.value!)}
                                placeholder="Enter title"
                            />
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">Description</IonLabel>
                            <IonTextarea
                                value={description}
                                onIonInput={(e) => setDescription(e.detail.value!)}
                                placeholder="Enter description (optional)"
                                rows={11}
                            />
                        </IonItem>
                    </>
                ) : (
                    <>
                        <IonItem>
                            <IonLabel position="stacked">Title</IonLabel>
                            <p style={{ marginTop: '8px', fontSize: '16px' }}>{task.title}</p>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">Description</IonLabel>
                            <p style={{ marginTop: '8px', fontSize: '16px' }}>{task.description || 'No description'}</p>
                        </IonItem>
                    </>
                )}
            </IonContent>

            <IonFooter>
                <IonToolbar>
                    {isEditing ? (
                        <>
                            <IonButton expand="block" onClick={handleSave}>
                                Save
                            </IonButton>
                            <IonButton expand="block" onClick={handleCancel} color="medium">
                                Cancel
                            </IonButton>
                        </>
                    ) : (
                        <>
                            {task.status !== TaskStatus.Done && (
                                <IonButton
                                    expand="block"
                                    onClick={handleDoneClick}
                                    color="success"
                                >
                                    Conquered
                                </IonButton>
                            )}
                        </>
                    )}
                </IonToolbar>
            </IonFooter>

            <IonAlert
                isOpen={showConfirmDialog}
                onDidDismiss={() => setShowConfirmDialog(false)}
                header="Mark as Conquered?"
                message="Are you sure you want to mark this task as conquered?"
                buttons={[
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {
                            setShowConfirmDialog(false);
                        }
                    },
                    {
                        text: 'Conquered',
                        role: 'confirm',
                        handler: () => {
                            handleConfirmDone();
                        }
                    }
                ]}
            />
        </IonPage>
    );
};

export default Task;
