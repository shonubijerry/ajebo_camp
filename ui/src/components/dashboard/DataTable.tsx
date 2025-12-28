import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Stack,
  Paper,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  UnfoldMore as ArrowUpDownIcon,
  KeyboardArrowUp as ChevronUpIcon,
  KeyboardArrowDown as ChevronDownIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  isLoading?: boolean;
  pageSize?: number;
}

export default function DataTable<T>({
  data,
  columns,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
  pageSize = 10,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  const tableColumns = React.useMemo(() => {
    const cols: ColumnDef<T>[] = [...columns];

    if (onView || onEdit || onDelete) {
      cols.push({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            {onView && (
              <Tooltip title="View">
                <IconButton
                  size="small"
                  onClick={() => onView(row.original)}
                  color="info"
                >
                  <ViewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => onEdit(row.original)}
                  color="primary"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => onDelete(row.original)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ),
      } as ColumnDef<T>);
    }

    return cols;
  }, [columns, onView, onEdit, onDelete]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Paper variant="outlined" sx={{ width: "100%", overflow: "hidden" }}>
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <TextField
          size="small"
          placeholder="Search all columns..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          fullWidth
          sx={{ maxWidth: 300 }}
        />
      </Box>

      <TableContainer>
        <Table stickyHeader aria-label="data table">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                sx={{
                  backgroundColor: "action.hover",
                  "& th": {
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  },
                }}
              >
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    sx={{
                      cursor: header.column.getCanSort() ? "pointer" : "default",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                      "&:hover": header.column.getCanSort()
                        ? {
                            bgcolor: "action.selected",
                          }
                        : {},
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <Box sx={{ display: "flex", alignItems: "center", opacity: 0.5 }}>
                          {header.column.getIsSorted() === "desc" ? (
                            <ChevronDownIcon fontSize="small" />
                          ) : header.column.getIsSorted() === "asc" ? (
                            <ChevronUpIcon fontSize="small" />
                          ) : (
                            <ArrowUpDownIcon fontSize="small" />
                          )}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                  "&:last-child td, &:last-child th": {
                    border: 0,
                  },
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {table.getRowModel().rows.length === 0 && (
        <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
          No results found
        </Box>
      )}

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={pagination.pageSize}
        page={pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
        onRowsPerPageChange={(e) => {
          table.setPageSize(Number(e.target.value));
        }}
      />
    </Paper>
  );
}
