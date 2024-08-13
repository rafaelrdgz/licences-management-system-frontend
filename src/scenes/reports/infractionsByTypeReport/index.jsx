import React from "react";
import { Header, TableToolbar } from "../../../components";
import {
  Box,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { tokens } from "../../../theme.js";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

function InfractionsByTypeReport() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [search, setSearch] = useState(false);

  const [info, setInfo] = useState({
    year: null,
    typesRows: [{
      id: 'Velocidad',
      quantity: 10,
      pointsDeducted: 30,
      infractionsPaid: 5,
      infractionsNoPaid: 5,
    },
    {
      id: 'Semáforo',
      quantity: 8,
      pointsDeducted: 16,
      infractionsPaid: 4,
      infractionsNoPaid: 4,
    },
    {
      id: 'Estacionamiento',
      quantity: 6,
      pointsDeducted: 6,
      infractionsPaid: 3,
      infractionsNoPaid: 3,
    },],
    infractionsRows: [{
      id: 'INF001',
      type: 'Velocidad',
      date: '2022-01-01',
      pointsDeducted: 3,
      paid: 'Pagado',
    },
    {
      id: 'INF002',
      type: 'Semáforo',
      date: '2022-01-02',
      pointsDeducted: 2,
      paid: 'No Pagado',
    },
    {
      id: 'INF003',
      type: 'Estacionamiento',
      date: '2022-01-03',
      pointsDeducted: 1,
      paid: 'Pagado',
    }],
  });

  const initialValues = {
    year: info.year,
  };

  const checkoutSchema = yup.object().shape({
    year: yup
      .date()
      .required("El año es requerido")
      .min(dayjs("1-1-2015"), "El año debe ser mayor a 2015")
      .max(dayjs(), "El año no puede ser mayor al actual"),
  });

  const typesColumns = [
    {
      field: "id",
      headerName: "Tipo",
      flex: 1,
    },
    {
      field: "quantity",
      headerName: "Cantidad",
      flex: 1,
    },
    {
      field: "pointsDeducted",
      headerName: "Puntos totales deducidos",
      flex: 1,
    },
    {
      field: "infractionsPaid",
      headerName: "Multas pagadas",
      flex: 1,
    },
    {
      field: "infractionsNoPaid",
      headerName: "Multas pendientes",
      flex: 1,
    },
  ];

  const infractionsColumns = [
    {
      field: "id",
      headerName: "Código de infracción",
      flex: 1,
    },
    {
      field: "type",
      headerName: "Tipo",
      flex: 1,
    },
    {
      field: "date",
      headerName: "Fecha",
      flex: 1,
    },
    {
      field: "pointsDeducted",
      headerName: "Puntos deducidos",
      flex: 1,
    },
    {
      field: "paid",
      headerName: "Estado del pago",
      flex: 1,
    },
  ];

  const handleFormSubmit = async (values) => {
    //se trae de la bd los datos y se guardan con setInfo
    console.log(values.year.format("YYYY"));
    setSearch(true);
    setInfo({ ...info, year: values.year.format("YYYY").toString()});
    console.log(info);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
  
    // Título del documento
    doc.setFontSize(18);
    doc.text("Reporte Consolidado de Infracciones", 14, 22);
    doc.setFontSize(14);
    doc.text(`Año: ${info.year}`, 14, 30);
  
    // Resumen por tipo de infracción
    doc.setFontSize(16);
    doc.text("Resumen por tipo", 14, 40);
  
    // Tabla de tipos de infracción
    autoTable(doc, {
      startY: 50,
      head: [["Tipo", "Cantidad", "Total de Puntos Deducidos", "Multas Pagadas", "Multas Pendientes"]],
      body: info.typesRows.map((row) => [
        row.id,
        row.quantity,
        row.pointsDeducted,
        row.infractionsPaid,
        row.infractionsNoPaid,
      ]),
    });
  
    // Infracciones registradas
    doc.setFontSize(16);
    doc.text("Infracciones registradas", 14, 100);
  
    // Tabla de infracciones registradas
    autoTable(doc, {
      startY: 110,
      head: [["Código de Infracción", "Tipo", "Fecha", "Puntos Deducidos", "Estado del Pago"]],
      body: info.infractionsRows.map((row) => [
        row.id,
        row.type,
        row.date,
        row.pointsDeducted,
        row.paid,
      ]),
    });
  
    // Guardar el PDF
    doc.save(`Reporte_Consolidado_Infracciones_${info.year}.pdf`);
  };
  

  return (
    <Box m={"20px"}>
      <Header
        title={"REPORTES"}
        subtitle={
          "Reporte Consolidado de Infracciones por Tipo en un Año Determinado"
        }
      />
      {search && (
        <Button
          sx={{ mb: "10px" }}
          color="secondary"
          variant="contained"
          onClick={handleExportPdf}
        >
          Exportar PDF
        </Button>
      )}
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={values.year}
                  onChange={(newValue) =>
                    handleChange({
                      target: { name: "year", value: newValue },
                    })
                  }
                  slotProps={{
                    textField: {
                      error: Boolean(touched.year && errors.year),
                      helperText: touched.year && errors.year,
                    },
                  }}
                  minDate={dayjs("1-1-2015")}
                  maxDate={dayjs()}
                  sx={{ gridColumn: "span 2" }}
                  label={"Año"}
                  views={["year"]}
                />
              </LocalizationProvider>
            </Box>
            <Button
              sx={{ mt: "10px" }}
              type="submit"
              color="secondary"
              variant="contained"
            >
              Buscar
            </Button>
          </form>
        )}
      </Formik>

      {search && (
        <div>
          <Typography
            variant="h4"
            sx={{ mt: "20px", mb: "10px" }}
            color={colors.gray[100]}
          >
            {" "}
            Año: {info.year}
          </Typography>
          <Typography
            variant="h4"
            sx={{ mt: "20px", mb: "10px" }}
            color={colors.gray[100]}
          >
            {" "}
            Resumen por tipo{" "}
          </Typography>
          <Box
            sx={{
              height: "40vh",
              maxflex: "100%",
              "& .actions": {
                color: "text.secondary",
              },
              "& .textPrimary": {
                color: "text.primary",
              },
            }}
          >
            <DataGrid
              localeText={esES.components.MuiDataGrid.defaultProps.localeText}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25, page: 0 },
                },
              }}
              rows={info.typesRows}
              columns={typesColumns}
              components={{
                Toolbar: () => (
                  <TableToolbar
                    columns={typesColumns}
                    rows={info.typesRows}
                    fileName={"Tipos de Infracciones"}
                  />
                ),
              }}
            />
          </Box>
          <Typography
            variant="h4"
            sx={{ mt: "20px", mb: "10px" }}
            color={colors.gray[100]}
          >
            {" "}
            Infracciones registradas{" "}
          </Typography>
          <Box
            sx={{
              height: "40vh",
              maxflex: "100%",
              "& .actions": {
                color: "text.secondary",
              },
              "& .textPrimary": {
                color: "text.primary",
              },
            }}
          >
            <DataGrid
              localeText={esES.components.MuiDataGrid.defaultProps.localeText}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25, page: 0 },
                },
              }}
              rows={info.infractionsRows}
              columns={infractionsColumns}
              components={{
                Toolbar: () => (
                  <TableToolbar
                    columns={infractionsColumns}
                    rows={info.infractionsRows}
                    fileName={"Infracciones"}
                  />
                ),
              }}
            />
          </Box>
        </div>
      )}
    </Box>
  );
}

export default InfractionsByTypeReport;