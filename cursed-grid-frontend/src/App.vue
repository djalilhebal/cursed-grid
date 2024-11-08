<template>
  <h1>Cursed Grid</h1>
  <ag-grid-vue class="ag-theme-alpine-dark" style="width: 100%; height: 500px; flex-grow: 1;" @grid-ready="onGridReady"
    :grid-options="gridOptions" :default-col-def="defaultColDef" :column-defs="columnDefs" :row-data="rowData"
    :suppress-row-transform="true" />
</template>

<script setup lang="ts">
import {
  ref,
} from 'vue';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-enterprise';
import {
  GridApi, GridOptions, GridReadyEvent,
} from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import createViewportDatasource from './createViewportDatasource';
import createMockServer from './createMockServer';

const defaultColDef = {
  flex: 1,
  minWidth: 100,
  resizable: true,
  sortable: false,
};

const weaponsColDef = [
  { field: 'id', headerName: 'ID', type: 'number', width: 80 },
  { field: 'name', headerName: 'Name', type: 'text' },
  { field: 'type', headerName: 'Type', type: 'text', width: 120 },
  {
    field: 'rarity', headerName: 'Rarity', type: 'number', width: 100,
    cellRenderer: (params) => {
      const stars = '★'.repeat(params.value);
      return `<span style="color: gold;">${stars}</span>`;
    }
  },
  { field: 'attack_power', headerName: 'Attack Power', type: 'number', width: 120 },
  { field: 'element', headerName: 'Element', type: 'text', width: 120 },
  {
    field: 'crit_rate', headerName: 'Crit Rate', type: 'number', width: 120,
    valueFormatter: (params) => `${(params.value * 100).toFixed(2)}%`
  },
  {
    field: 'crit_damage', headerName: 'Crit Damage', type: 'number', width: 120,
    valueFormatter: (params) => `${(params.value * 100).toFixed(2)}%`
  },
  { field: 'effect_description', headerName: 'Effect', type: 'text' },
  { field: 'level', headerName: 'Level', type: 'number', width: 100 },
  { field: 'upgrade_cost', headerName: 'Upgrade Cost', type: 'number', width: 120 },
  { field: 'creation_date', headerName: 'Created', type: 'date', width: 150, hide: true },
];

const columnDefs = weaponsColDef;

const gridOptions = ref<GridOptions>({
  rowModelType: 'viewport',
  cacheBlockSize: 100,
  maxConcurrentDatasourceRequests: 2,
  infiniteInitialRowCount: 1,
  maxBlocksInCache: 10,
  suppressRowTransform: true,

  // TODO: LEARN: Does it only work with rowModelType = 'serverSide'?
  suppressServerSideFullWidthLoadingRow: true,
});

// Setting rowData to `null` or `undefined` makes AG Grid display a loading indicator.
const rowData = ref<any[] | null>(null);

const gridApi = ref<GridApi | null>(null);

const onGridReady = (params: GridReadyEvent) => {
  gridApi.value = params.api;

  const mockServer = createMockServer();
  const viewportDatasource = createViewportDatasource(mockServer);
  gridApi.value!.setGridOption("viewportDatasource", viewportDatasource);
};
</script>

<style>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

body {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

#app {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

h1 {
  background: #181d1f;
  padding: 0.25em;
  font-size: xxx-large;
  color: violet;
  text-align: center;
}
</style>
