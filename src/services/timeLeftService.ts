import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';


const TimeLeft = (value: string = "") => {
    if (value === null || value === "") {
        return '18:10:35';
    } else {
        return '00:37:35';
    }
};

export default TimeLeft;