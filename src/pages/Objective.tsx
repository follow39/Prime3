import { IonContent, IonHeader, IonButtons, IonBackButton, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonFooter, useIonRouter } from '@ionic/react';
import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Objective as ObjectiveModel, ObjectiveStatus } from '../models/Objective';
import { StorageServiceContext } from '../App';
import TimeLeft from '../services/timeLeftService';
import PreferencesService from '../services/preferencesService';

const Objective: React.FC = () => {
    const location = useLocation<{ objective: ObjectiveModel }>();
    const router = useIonRouter();
    const storageServ = useContext(StorageServiceContext);

    const [objective, setObjective] = useState<ObjectiveModel | null>(null);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [headerTimeLeft, setHeaderTimeLeft] = useState<string>('');
    const [earliestEndTime, setEarliestEndTime] = useState<string>('22:00');

    useEffect(() => {
        if (location.state?.objective) {
            const objectiveData = location.state.objective;
            setObjective(objectiveData);
            setTitle(objectiveData.title);
            setDescription(objectiveData.description || '');
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

        if (!objective) return;

        try {
            const updatedObjective: ObjectiveModel = {
                ...objective,
                title: title.trim(),
                description: description.trim()
            };

            await storageServ.updateObjective(updatedObjective);
            setObjective(updatedObjective);
            setIsEditing(false);
        } catch (error) {
            const msg = `Error updating objective: ${error}`;
            console.error(msg);
        }
    };

    const handleToggleStatus = async () => {
        if (!objective) return;

        try {
            const newStatus = objective.status === ObjectiveStatus.Done ? ObjectiveStatus.Open : ObjectiveStatus.Done;
            const updatedObjective: ObjectiveModel = {
                ...objective,
                status: newStatus
            };

            await storageServ.updateObjective(updatedObjective);
            setObjective(updatedObjective);

            // Navigate back to home page
            if (newStatus === ObjectiveStatus.Done) {
                router.push('/home', 'back');
            }
        } catch (error) {
            const msg = `Error updating objective status: ${error}`;
            console.error(msg);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (objective) {
            setTitle(objective.title);
            setDescription(objective.description || '');
        }
        setIsEditing(false);
    };

    if (!objective) {
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
                    <p>No objective data available</p>
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
                                rows={5}
                            />
                        </IonItem>
                    </>
                ) : (
                    <>
                        <IonItem>
                            <IonLabel position="stacked">Title</IonLabel>
                            <p style={{ marginTop: '8px', fontSize: '16px' }}>{objective.title}</p>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">Description</IonLabel>
                            <p style={{ marginTop: '8px', fontSize: '16px' }}>{objective.description || 'No description'}</p>
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
                        <IonButton
                            expand="block"
                            onClick={handleToggleStatus}
                            color={objective.status === ObjectiveStatus.Done ? 'primary' : 'success'}
                        >
                            {objective.status === ObjectiveStatus.Done ? 'Uncharted' : 'Conquered'}
                        </IonButton>
                    )}
                </IonToolbar>
            </IonFooter>
        </IonPage>
    );
};

export default Objective;
