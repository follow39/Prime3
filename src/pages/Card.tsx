import { IonContent, IonHeader, IonButtons, IonBackButton, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonTextarea, IonButton, useIonRouter } from '@ionic/react';
import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card as CardModel, CardStatus } from '../models/Card';
import { StorageServiceContext } from '../App';
import { Toast } from '@capacitor/toast';

const Card: React.FC = () => {
    const location = useLocation<{ card: CardModel }>();
    const router = useIonRouter();
    const storageServ = useContext(StorageServiceContext);

    const [card, setCard] = useState<CardModel | null>(null);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);

    useEffect(() => {
        if (location.state?.card) {
            const cardData = location.state.card;
            setCard(cardData);
            setTitle(cardData.title);
            setDescription(cardData.description || '');
        }
    }, [location.state]);

    const handleSave = async () => {
        if (!title.trim()) {
            Toast.show({
                text: 'Title cannot be empty',
                duration: 'long'
            });
            return;
        }

        if (!card) return;

        try {
            const updatedCard: CardModel = {
                ...card,
                title: title.trim(),
                description: description.trim()
            };

            await storageServ.updateCard(updatedCard);
            setCard(updatedCard);
            setIsEditing(false);

            Toast.show({
                text: 'Card updated successfully',
                duration: 'short'
            });
        } catch (error) {
            const msg = `Error updating card: ${error}`;
            console.error(msg);
            Toast.show({
                text: msg,
                duration: 'long'
            });
        }
    };

    const handleToggleStatus = async () => {
        if (!card) return;

        try {
            const newStatus = card.status === CardStatus.Done ? CardStatus.Open : CardStatus.Done;
            const updatedCard: CardModel = {
                ...card,
                status: newStatus
            };

            await storageServ.updateCard(updatedCard);
            setCard(updatedCard);

            Toast.show({
                text: newStatus === CardStatus.Done ? 'Card marked as done' : 'Card marked as undone',
                duration: 'short'
            });
        } catch (error) {
            const msg = `Error updating card status: ${error}`;
            console.error(msg);
            Toast.show({
                text: msg,
                duration: 'long'
            });
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (card) {
            setTitle(card.title);
            setDescription(card.description || '');
        }
        setIsEditing(false);
    };

    if (!card) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot='start'>
                            <IonBackButton defaultHref='/home' />
                        </IonButtons>
                        <IonTitle>Card</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <p>No card data available</p>
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
                    <IonTitle>Card Details</IonTitle>
                    <IonButtons slot='end'>
                        <IonButton
                            onClick={handleToggleStatus}
                            color={card.status === CardStatus.Done ? 'success' : 'primary'}
                        >
                            {card.status === CardStatus.Done ? 'Undone' : 'Done'}
                        </IonButton>
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
                        <IonButton expand="block" onClick={handleSave} className="ion-margin-top">
                            Save
                        </IonButton>
                        <IonButton expand="block" onClick={handleCancel} color="medium">
                            Cancel
                        </IonButton>
                    </>
                ) : (
                    <>
                        <IonItem>
                            <IonLabel position="stacked">Title</IonLabel>
                            <p style={{ marginTop: '8px', fontSize: '16px' }}>{card.title}</p>
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">Description</IonLabel>
                            <p style={{ marginTop: '8px', fontSize: '16px' }}>{card.description || 'No description'}</p>
                        </IonItem>
                        <IonButton expand="block" onClick={handleEdit} className="ion-margin-top">
                            Edit
                        </IonButton>
                    </>
                )}
            </IonContent>
        </IonPage>
    );
};

export default Card;