export interface Card {
    id: number
    title: string
    description: string
    status: number
    creation_date: string
    active: number
}

export enum CardStatus {
    Open = 1,
    Done,
    Overdue,
};