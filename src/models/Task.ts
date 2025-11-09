export interface Task {
    id: number
    title: string
    description: string
    status: number
    creation_date: string
    active: number
}

export enum TaskStatus {
    Open = 1,
    Done,
    Overdue,
};
