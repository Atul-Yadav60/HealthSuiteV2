import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Define the PDF document component
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    padding: 30,
    color: "#333",
  },
  header: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    color: "#1a1a2e",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#6366F1",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 5,
  },
  label: {
    fontWeight: "bold",
  },
  value: {
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "grey",
    fontSize: 9,
  },
});

const ReportPDF = ({ reportData }: { reportData: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Aarogya AI Health Report</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Report Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Report ID:</Text>
          <Text style={styles.value}>{reportData.report_id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>
            {new Date(reportData.timestamp).toLocaleString()}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Analysis Type:</Text>
          <Text style={styles.value}>
            {reportData.json_data.analysisType || reportData.feature}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analysis Results</Text>
        {Object.entries(reportData.json_data).map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>
              {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) =>
                str.toUpperCase())}
              :
            </Text>
            <Text style={styles.value}>{String(value)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        This is an AI-generated report. Always consult with a qualified
        healthcare professional for medical advice.
      </Text>
    </Page>
  </Document>
);

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { reportId } = await req.json();
    if (!reportId) throw new Error("reportId is required");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Fetch the report data
    const { data: reportData, error: reportError } = await supabaseAdmin
      .from("reports")
      .select("*")
      .eq("report_id", reportId)
      .single();

    if (reportError) throw reportError;
    if (!reportData) throw new Error("Report not found");

    // 2. Render the React component to a PDF stream
    const pdfStream = await renderToStream(
      <ReportPDF reportData={reportData} />
    );

    // 3. Upload the PDF to Supabase Storage
    const filePath = `reports/${reportData.user_id}/${reportId}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("generated_pdfs")
      .upload(filePath, pdfStream, {
        contentType: "application/pdf",
        upsert: true, // Overwrite if it already exists
      });

    if (uploadError) throw uploadError;

    // 4. Get the public URL of the uploaded PDF
    const { data: urlData } = supabaseAdmin.storage
      .from("generated_pdfs")
      .getPublicUrl(filePath);

    return new Response(JSON.stringify({ pdfUrl: urlData.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});