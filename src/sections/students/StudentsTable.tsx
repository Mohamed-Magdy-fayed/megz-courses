import { format } from "date-fns";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { getInitials } from "src/utils/getInitials";
import { MouseEvent } from "react";
import Scrollbar from "@/components/Scrollbar";
import { Student } from "@/pages/students";
import { useMemo } from "react";
import { applyPagination } from "@/utils/applyPagination";
import { useSelection } from "@/hooks/UseSelection";
import AlertDialogSlide from "@/components/students/AlertDialog";

interface StudentsTableProps {
  items?: Student[];
  onPageChange: (
    event: MouseEvent<HTMLButtonElement> | null,
    page: number
  ) => void;
  onRowsPerPageChange: (event: any) => void;
  page: number;
  rowsPerPage: number;
  count: number;
}

const useStudentsIds = (students: Student[]) => {
  return useMemo(() => {
    return students.map((student) => student.id);
  }, [students]);
};

export const StudentsTable = (props: StudentsTableProps) => {
  if (props.items == null || props.items.length === 0) return <h1>No users</h1>;

  const {
    items = [],
    onPageChange = () => {},
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
    count,
  } = props;

  const studentsIds = useStudentsIds(items);
  const studentsSelection = useSelection(studentsIds);

  const onDeselectAll = studentsSelection.handleDeselectAll;
  const onDeselectOne = studentsSelection.handleDeselectOne;
  const onSelectAll = studentsSelection.handleSelectAll;
  const onSelectOne = studentsSelection.handleSelectOne;
  const selected = studentsSelection.selected;

  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;

  const getAddress = (student: Student) => `${
    student.address?.city || "no city"
  }, ${student.address?.state || "no state"}, 
  ${student.address?.country || "no country"}`;

  return (
    <Card>
      <Scrollbar>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onSelectAll();
                    } else {
                      onDeselectAll();
                    }
                  }}
                />
              </TableCell>
              {selected.length > 0 ? (
                <TableCell className="flex items-center gap-4">
                  <AlertDialogSlide
                    buttonLabel="Delete"
                    buttonProps={{ color: "warning" }}
                    userIds={selected}
                  ></AlertDialogSlide>
                  <Button color="info">edit</Button>
                </TableCell>
              ) : (
                <>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Signed Up</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody className="whitespace-nowrap">
            {props.items.map((student) => {
              const isSelected = selected.includes(student.id);
              const createdAt = format(student.createdAt, "dd/MM/yyyy");

              return (
                <TableRow hover key={student.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          onSelectOne?.(student.id);
                        } else {
                          onDeselectOne?.(student.id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack alignItems="center" direction="row" spacing={2}>
                      <Avatar src={student.image || ""}>
                        {getInitials(student.name || "")}
                      </Avatar>
                      <Typography variant="subtitle2">
                        {student.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{getAddress(student)}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>{createdAt}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};
