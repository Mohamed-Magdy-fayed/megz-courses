import { useCallback, useMemo, useState, MouseEvent, ReactNode } from "react";
import Head from "next/head";
import { subDays, subHours } from "date-fns";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";
import ArrowUpOnSquareIcon from "@heroicons/react/24/solid/ArrowUpOnSquareIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import {
  Box,
  Button,
  Container,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { useSelection } from "src/hooks/UseSelection";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { StudentsTable } from "@/sections/students/StudentsTable";
import { StudentsSearch } from "@/sections/students/StudentsSearch";
import { applyPagination } from "src/utils/applyPagination";
import TransitionsModal from "@/components/Modal";
import AddStudentForm from "@/components/students/AddStudentForm";

const now = new Date();

interface Student {
  id: string;
  address: {
    city: string;
    country: string;
    state: string;
    street: string;
  };
  avatar: string;
  createdAt: number;
  email: string;
  name: string;
  phone: string;
}

const data: Student[] = [
  {
    id: "5e887ac47eed253091be10cb",
    address: {
      city: "Cleveland",
      country: "USA",
      state: "Ohio",
      street: "2849 Fulton Street",
    },
    avatar: "avatars/avatar-carson-darrin.png",
    createdAt: subDays(subHours(now, 7), 1).getTime(),
    email: "carson.darrin@devias.io",
    name: "Carson Darrin",
    phone: "304-428-3097",
  },
  {
    id: "5e887b209c28ac3dd97f6db5",
    address: {
      city: "Atlanta",
      country: "USA",
      state: "Georgia",
      street: "1865  Pleasant Hill Road",
    },
    avatar: "avatars/avatar-fran-perez.png",
    createdAt: subDays(subHours(now, 1), 2).getTime(),
    email: "fran.perez@devias.io",
    name: "Fran Perez",
    phone: "712-351-5711",
  },
  {
    id: "5e887b7602bdbc4dbb234b27",
    address: {
      city: "North Canton",
      country: "USA",
      state: "Ohio",
      street: "4894  Lakeland Park Drive",
    },
    avatar: "avatars/avatar-jie-yan-song.png",
    createdAt: subDays(subHours(now, 4), 2).getTime(),
    email: "jie.yan.song@devias.io",
    name: "Jie Yan Song",
    phone: "770-635-2682",
  },
  {
    id: "5e86809283e28b96d2d38537",
    address: {
      city: "Madrid",
      country: "Spain",
      state: "Anika Visser",
      street: "4158  Hedge Street",
    },
    avatar: "avatars/avatar-anika-visser.png",
    createdAt: subDays(subHours(now, 11), 2).getTime(),
    email: "anika.visser@devias.io",
    name: "Anika Visser",
    phone: "908-691-3242",
  },
  {
    id: "5e86805e2bafd54f66cc95c3",
    address: {
      city: "San Diego",
      country: "USA",
      state: "California",
      street: "75247",
    },
    avatar: "avatars/avatar-miron-vitold.png",
    createdAt: subDays(subHours(now, 7), 3).getTime(),
    email: "miron.vitold@devias.io",
    name: "Miron Vitold",
    phone: "972-333-4106",
  },
  {
    id: "5e887a1fbefd7938eea9c981",
    address: {
      city: "Berkeley",
      country: "USA",
      state: "California",
      street: "317 Angus Road",
    },
    avatar: "avatars/avatar-penjani-inyene.png",
    createdAt: subDays(subHours(now, 5), 4).getTime(),
    email: "penjani.inyene@devias.io",
    name: "Penjani Inyene",
    phone: "858-602-3409",
  },
  {
    id: "5e887d0b3d090c1b8f162003",
    address: {
      city: "Carson City",
      country: "USA",
      state: "Nevada",
      street: "2188  Armbrester Drive",
    },
    avatar: "avatars/avatar-omar-darboe.png",
    createdAt: subDays(subHours(now, 15), 4).getTime(),
    email: "omar.darobe@devias.io",
    name: "Omar Darobe",
    phone: "415-907-2647",
  },
  {
    id: "5e88792be2d4cfb4bf0971d9",
    address: {
      city: "Los Angeles",
      country: "USA",
      state: "California",
      street: "1798  Hickory Ridge Drive",
    },
    avatar: "avatars/avatar-siegbert-gottfried.png",
    createdAt: subDays(subHours(now, 2), 5).getTime(),
    email: "siegbert.gottfried@devias.io",
    name: "Siegbert Gottfried",
    phone: "702-661-1654",
  },
  {
    id: "5e8877da9a65442b11551975",
    address: {
      city: "Murray",
      country: "USA",
      state: "Utah",
      street: "3934  Wildrose Lane",
    },
    avatar: "avatars/avatar-iulia-albu.png",
    createdAt: subDays(subHours(now, 8), 6).getTime(),
    email: "iulia.albu@devias.io",
    name: "Iulia Albu",
    phone: "313-812-8947",
  },
  {
    id: "5e8680e60cba5019c5ca6fda",
    address: {
      city: "Salt Lake City",
      country: "USA",
      state: "Utah",
      street: "368 Lamberts Branch Road",
    },
    avatar: "avatars/avatar-nasimiyu-danai.png",
    createdAt: subDays(subHours(now, 1), 9).getTime(),
    email: "nasimiyu.danai@devias.io",
    name: "Nasimiyu Danai",
    phone: "801-301-7894",
  },
];

const useStudents = (page: number, rowsPerPage: number) => {
  return useMemo(() => {
    return applyPagination(data, page, rowsPerPage);
  }, [page, rowsPerPage]);
};

const useStudentsIds = (students: Student[]) => {
  return useMemo(() => {
    return students.map((student) => student.id);
  }, [students]);
};

const Page = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const students = useStudents(page, rowsPerPage);
  const studentsIds = useStudentsIds(students);
  const studentsSelection = useSelection(studentsIds);

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
          <StudentsTable
            count={data.length}
            items={students}
            onDeselectAll={studentsSelection.handleDeselectAll}
            onDeselectOne={studentsSelection.handleDeselectOne}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onSelectAll={studentsSelection.handleSelectAll}
            onSelectOne={studentsSelection.handleSelectOne}
            page={page}
            rowsPerPage={rowsPerPage}
            selected={studentsSelection.selected}
          />
        </Stack>
      </Box>
    </DashboardLayout>
  );
};

export default Page;
