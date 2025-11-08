export interface Objective {
    id: number
    title: string
    description: string
    status: number
    creation_date: string
    active: number
}

export enum ObjectiveStatus {
    Open = 1,
    Done,
    Overdue,
};