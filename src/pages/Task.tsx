import { IonContent, IonHeader, IonButtons, IonBackButton, IonPage, IonToolbar, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonFooter, IonAlert, useIonRouter } from '@ionic/react';
import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Task as TaskModel, TaskStatus } from '../models/Task';
import { StorageServiceContext } from '../App';
import HeaderTimeLeft from '../components/HeaderTimeLeft';
import NotificationService from '../services/notificationService';
import { validateAndSanitizeTitle, validateAndSanitizeDescription } from '../utils/validation';
import { Toast } from '@capacitor/toast';

const Task: React.FC = () => {
    const location = useLocation<{ task: TaskModel }>();
    const router = useIonRouter();
    const storageServ = useContext(StorageServiceContext);

    const [task, setTask] = useState<TaskModel | null>(null);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

    useEffect(() => {
        if (location.state?.task) {
            const taskData = location.state.task;
            setTask(taskData);
            setTitle(taskData.title);
            setDescription(taskData.description || '');
        }
    }, [location.state]);

    const handleSave = async () => {
        if (!task) return;

        // Validate and sanitize title
        const titleResult = validateAndSanitizeTitle(title);
        if (!titleResult.validation.isValid) {
            await Toast.show({
                text: titleResult.validation.error || 'Invalid title',
                duration: 'long'
            });
            return;
        }

        // Validate and sanitize description
        const descResult = validateAndSanitizeDescription(description);
        if (!descResult.validation.isValid) {
            await Toast.show({
                text: descResult.validation.error || 'Invalid description',
                duration: 'long'
            });
            return;
        }

        try {
            const updatedTask: TaskModel = {
                ...task,
                title: titleResult.sanitized,
                description: descResult.sanitized
            };

            await storageServ.updateTask(updatedTask);
            setTask(updatedTask);
            setTitle(titleResult.sanitized);
            setDescription(descResult.sanitized);
            setIsEditing(false);
        } catch (error) {
            const msg = `Error updating task: ${error}`;
            console.error(msg);
            await Toast.show({
                text: 'Failed to save task',
                duration: 'long'
            });
        }
    };

    const handleDoneClick = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmDone = async () => {
        if (!task) return;

        try {
            const updatedTask: TaskModel = {
                ...task,
                status: TaskStatus.Done
            };

            await storageServ.updateTask(updatedTask);
            setTask(updatedTask);

            // Check if all tasks are now complete
            const today = new Date().toISOString().split('T')[0];
            const todaysTasks = await storageServ.getTasksByDate(today);
            const allComplete = todaysTasks.length > 0 && todaysTasks.every(t => t.status === TaskStatus.Done);

            if (allComplete) {
                // All tasks complete - switch to review mode
                await NotificationService.switchToReviewMode();
            }

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
                        <HeaderTimeLeft />
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
                    <HeaderTimeLeft />
                    {!isEditing && (
                        <IonButtons slot='end'>
                            <IonButton onClick={handleEdit}>
                                Edit
                            </IonButton>
                        </IonButtons>
                    )}
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
                                    Done
                                </IonButton>
                            )}
                        </>
                    )}
                </IonToolbar>
            </IonFooter>

            <IonAlert
                isOpen={showConfirmDialog}
                onDidDismiss={() => setShowConfirmDialog(false)}
                header="Mark as Done?"
                message="Are you sure you want to mark this task as done?"
                buttons={[
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {
                            setShowConfirmDialog(false);
                        }
                    },
                    {
                        text: 'Done',
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
