import { useCallback, useMemo, useState, MouseEvent, useEffect } from "react";
import { subDays, subHours } from "date-fns";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";
import ArrowUpOnSquareIcon from "@heroicons/react/24/solid/ArrowUpOnSquareIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import { Box, Button, Stack, SvgIcon, Typography } from "@mui/material";
import { useSelection } from "src/hooks/UseSelection";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { StudentsTable } from "@/sections/students/StudentsTable";
import { StudentsSearch } from "@/sections/students/StudentsSearch";
import TransitionsModal from "@/components/Modal";
import AddStudentForm from "@/components/students/AddStudentForm";
import { api } from "@/utils/api";
import Spinner from "@/components/Spinner";
import { applyPagination } from "@/utils/applyPagination";

export interface Student {
  id: string;
  address?: {
    city?: string | null;
    country?: string | null;
    state?: string | null;
    street?: string | null;
  };
  image?: string | null;
  createdAt: Date;
  email: string | null;
  name: string | null;
  phone?: string | null;
}

const Page = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const getStudents = api.students.getStudents.useQuery();

  const useStudents = (data: Student[], page: number, rowsPerPage: number) => {
    return useMemo(() => {
      return applyPagination(data, page, rowsPerPage);
    }, [data, page, rowsPerPage]);
  };

  const students = useStudents(
    getStudents.isSuccess ? getStudents.data : [],
    page,
    rowsPerPage
  );

  useEffect(() => {
    console.log(getStudents.data);
  }, []);

  const handlePageChange = useCallback(
    (event: MouseEvent<HTMLButtonElement> | null, value: number) => {
      setPage(value);
    },
    []
  );

  const handleRowsPerPageChange = useCallback((event: any) => {
    setRowsPerPage(event.target.value);
  }, []);

  return (
    <DashboardLayout>
      <Box component="main">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">Students</Typography>
              <Stack alignItems="center" direction="row" spacing={1}>
                <Button
                  color="inherit"
                  startIcon={
                    <SvgIcon fontSize="small">
                      <ArrowUpOnSquareIcon />
                    </SvgIcon>
                  }
                >
                  Import
                </Button>
                <Button
                  color="inherit"
                  startIcon={
                    <SvgIcon fontSize="small">
                      <ArrowDownOnSquareIcon />
                    </SvgIcon>
                  }
                >
                  Export
                </Button>
              </Stack>
            </Stack>
            <div>
              <TransitionsModal
                modalTitle="Create a student"
                buttonProps={{
                  startIcon: (
                    <SvgIcon fontSize="small">
                      <PlusIcon />
                    </SvgIcon>
                  ),
                  className: "bg-primary",
                  variant: "contained",
                }}
                buttonChildren={"Add"}
              >
                <AddStudentForm></AddStudentForm>
              </TransitionsModal>
            </div>
          </Stack>
          <StudentsSearch />
          {getStudents.isError && <h1>Error</h1>}
          {getStudents.isLoading && <Spinner></Spinner>}
          {getStudents.isSuccess && (
            <StudentsTable
              count={getStudents.data.length}
              items={students}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
            />
          )}
        </Stack>
      </Box>
    </DashboardLayout>
  );
};

export default Page;
