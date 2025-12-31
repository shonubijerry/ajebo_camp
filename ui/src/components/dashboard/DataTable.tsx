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
  useMediaQuery,
  useTheme,
  Typography,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  const tableColumns = React.useMemo(() => {
    const cols: ColumnDef<T>[] = [...columns];

    // On mobile, show only first 3 columns plus actions
    if (isMobile) {
      const visibleCols = cols.slice(0, 3);
      
      if (onView || onEdit || onDelete) {
        visibleCols.push({
          id: "actions",
          header: "",
          cell: ({ row }) => (
            <Stack direction="row" spacing={0}>
              {onView && (
                <IconButton
                  size="small"
                  onClick={() => onView(row.original)}
                  color="info"
                  sx={{ padding: "4px" }}
                >
                  <ViewIcon fontSize="small" />
                </IconButton>
              )}
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={() => onEdit(row.original)}
                  color="primary"
                  sx={{ padding: "4px" }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  size="small"
                  onClick={() => onDelete(row.original)}
                  color="error"
                  sx={{ padding: "4px" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          ),
        } as ColumnDef<T>);
      }
      
      return visibleCols;
    }

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
  }, [columns, onView, onEdit, onDelete, isMobile]);

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
      <Box sx={{ p: { xs: 1, sm: 2 }, borderBottom: "1px solid", borderColor: "divider" }}>
        <TextField
          size="small"
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          fullWidth
          sx={{ maxWidth: isMobile ? "100%" : 300 }}
        />
      </Box>

      <TableContainer sx={{ overflowX: "auto", maxWidth: "100%" }}>
        <Table 
          stickyHeader 
          aria-label="data table"
          size={isMobile ? "small" : "medium"}
          sx={{
            tableLayout: isMobile ? "auto" : "auto",
            width: "100%",
            "& td, & th": {
              fontSize: isMobile ? "0.7rem" : "0.875rem",
              padding: isMobile ? "6px 4px" : "16px",
              maxWidth: isMobile ? "120px" : "none",
              overflow: isMobile ? "hidden" : "visible",
              textOverflow: isMobile ? "ellipsis" : "clip",
            },
          }}
        >
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                sx={{
                  backgroundColor: "action.hover",
                  "& th": {
                    fontWeight: 600,
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && !isMobile && (
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
                  <TableCell 
                    key={cell.id}
                    sx={{
                      whiteSpace: isMobile ? "normal" : "nowrap",
                      wordBreak: isMobile ? "break-word" : "normal",
                    }}
                  >
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

      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          p: isMobile ? 1 : 2,
          borderTop: "1px solid",
          borderColor: "divider",
          gap: 1,
        }}
      >
        {isMobile ? (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="caption" color="text.secondary">
                {`${pagination.pageIndex * pagination.pageSize + 1}-${Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )} of ${table.getFilteredRowModel().rows.length}`}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  variant="outlined"
                >
                  Prev
                </Button>
                <Button
                  size="small"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  variant="outlined"
                >
                  Next
                </Button>
              </Stack>
            </Box>
          </>
        ) : (
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
            sx={{ width: "100%", border: 0 }}
          />
        )}
      </Box>
    </Paper>
  );
}
