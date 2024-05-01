import { CircleDollarSign, ListTodo, Users2 } from "lucide-react";
import { api } from "@/lib/api";
import { getDifferenceMargin, getLastWeekDate } from "@/lib/utils";
import { useEffect, useState } from "react";
import StateCard from "./StateCard";

export type StateOverview = {
  title: string
  target: number
  style: "currency" | "percent" | ""
  icon: JSX.Element
  textColor: string
  backgroundColor: string
  sinceLastWeek: number
  isLiability: boolean
  progress?: boolean
  totalOrders?: number
}

export default function StatesOverview() {
  const salesAgentsQuery = api.salesAgents.getSalesAgents.useQuery()
  const studentsQuery = api.users.getUsers.useQuery({ userType: "student" })
  const operationsQuery = api.salesOperations.getAll.useQuery()
  const ordersQuery = api.orders.getAll.useQuery()

  const [budget, setBudget] = useState<StateOverview>({
    title: "Budget",
    target: 0,
    style: "currency",
    icon: <CircleDollarSign className="text-background"></CircleDollarSign>,
    textColor: "text-red-500",
    backgroundColor: "bg-red-500",
    sinceLastWeek: 0,
    isLiability: true
  })
  const [students, setStudents] = useState<StateOverview>({
    title: "Total students",
    target: 0,
    style: "",
    icon: <Users2 className="text-background"></Users2>,
    textColor: "text-green-500",
    backgroundColor: "bg-green-500",
    sinceLastWeek: 0,
    isLiability: false
  })
  const [tasks, setTasks] = useState<StateOverview>({
    title: "Tasks progress",
    target: 0,
    style: "percent",
    icon: <ListTodo className="text-background"></ListTodo>,
    progress: true,
    textColor: "text-orange-500",
    backgroundColor: "bg-orange-500",
    sinceLastWeek: 0,
    isLiability: false,
  })
  const [income, setIncome] = useState<StateOverview>({
    title: "Total Income",
    target: 0,
    style: "currency",
    icon: <CircleDollarSign className="text-background"></CircleDollarSign>,
    textColor: "text-indigo-500",
    backgroundColor: "bg-indigo-500",
    sinceLastWeek: 0,
    isLiability: false,
  })

  const dataLoader = () => {
    salesAgentsQuery.refetch()
      .then(({ data }) => {
        const {
          difference: salariesSinceLastWeek,
          total: currentTotalSalaries
        } = data?.salesAgents
            ? getDifferenceMargin(data?.salesAgents, "salary")
            : { difference: 0, total: 0 }

        setBudget(prev => ({
          ...prev,
          target: currentTotalSalaries,
          sinceLastWeek: salariesSinceLastWeek,
        }))
      })

    studentsQuery.refetch()
      .then(({ data }) => {
        const {
          difference: studentsSinceLastWeek,
          total: totalStudents
        } = data?.users
            ? getDifferenceMargin(data?.users, "id")
            : { difference: 0, total: 0 }

        setStudents(prev => ({
          ...prev,
          target: totalStudents,
          sinceLastWeek: studentsSinceLastWeek,
        }))
      })

    operationsQuery.refetch()
      .then(({ data }) => {
        const {
          difference: progressSinceLastWeek,
          total: progress
        } = data?.salesOperations
            ? getDifferenceMargin(data?.salesOperations.filter(op => op.status === "completed").map(op => ({ ...op, createdAt: op.updatedAt })), "id")
            : { difference: 0, total: 0 }

        setTasks(prev => ({
          ...prev,
          target: progress / (data?.salesOperations.length || 1),
          sinceLastWeek: progressSinceLastWeek,
        }))
      })

    ordersQuery.refetch()
      .then(({ data }) => {

        const totalOrders = data?.orders.length
        const {
          difference: totalIncomeSinceLastWeek,
          total: totalIncome
        } = data?.orders
            ? getDifferenceMargin(data.orders, "amount")
            : { difference: 0, total: 0 }

        setIncome(prev => ({
          ...prev,
          target: totalIncome,
          sinceLastWeek: totalIncomeSinceLastWeek,
          totalOrders,
        }))
      })
  }

  useEffect(dataLoader, [])

  return (
    <>
      <StateCard state={budget} />
      <StateCard state={students} />
      <StateCard state={tasks} />
      <StateCard state={income} />
    </>
  );
}
