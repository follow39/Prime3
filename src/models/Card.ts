export interface Card {
    id: number
    title: string
    description: string
    status: number
    end_time: string
    creation_date: string
    active: number
}

export enum CardStatus {
    Open = 1,
    Done,
    Overdue,
};