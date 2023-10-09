import { DataGrid, GridRowModel, GridRowSelectionModel } from '@mui/x-data-grid';
import axiosInstance from './AxiosConfig'
import { Song } from '@lib/shared_types';

const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
  console.log(newRow, oldRow);
  return new Promise((resolve, reject) => {
    const { id, ...updateData } = newRow;
    axiosInstance.put(`/songs/${newRow.id}`, updateData)
    .then(response => {
      console.log(response)
      if (response.status !== 200) {
        console.error('Error updating song in backend:');
      }
    })
    .catch(error => {
      console.error('Error updating song:', error);
      reject();
    });
    resolve(newRow);
  });
}

const handleProcessRowUpdateError = () => {
  console.log("error");
}

const isValidURL = (str: string) => {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR, IP address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment
  return !!pattern.test(str);
}

const columns = [
  { field: 'id', headerName: 'ID'},
  { field: 'title', headerName: 'Title', flex: 2, editable: true },
  { field: 'author', headerName: 'Author', flex: 2, editable: true },
  { 
    field: 'link', 
    headerName: 'Link', 
    flex: 3, 
    editable: true,
    renderCell: (params: any) => {
      if (typeof params.value === 'string' && isValidURL(params.value)) {
        return (
          <a href={params.value} target="_blank" rel="noopener noreferrer">
            {params.value}
          </a>
        );
      }
      return params.value;  // Just display the value without making it a link
    }    
  },
];

type MyDataGridProps = {
  rows: Song[];
  selectedRows: string[]; 
  setSelectedRows: (selected: GridRowSelectionModel) => void;
};

function MyDataGrid({ rows, selectedRows, setSelectedRows }: MyDataGridProps) {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid 
          rows={rows} 
          columns={columns} 
          checkboxSelection
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          columnVisibilityModel={{id: false}}
          onRowSelectionModelChange={(newSelectedRows) => {
            setSelectedRows(newSelectedRows);
          }}
          rowSelectionModel={selectedRows}
          hideFooterPagination 
          hideFooterSelectedRowCount 
          hideFooter
      />
    </div>
  );
}

export default MyDataGrid;
