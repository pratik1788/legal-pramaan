import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  type AgreementData,
  type DocLocale,
  getAgreementTemplate,
} from "./agreement";

// v1 is English-only and uses react-pdf's built-in Helvetica.
//
// PHASE 2 (Gujarati): register the bundled Noto Sans Gujarati font here
// (public/fonts/NotoSansGujarati.ttf, OFL licensed — already in the repo) via
//   Font.register({ family: "NotoSansGujarati", src: FONT_PATH })
// and add `fontFamily: "NotoSansGujarati"` to the styles below. The template
// abstraction in lib/agreement.ts supplies the Gujarati strings; no renderer
// logic needs to change.

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10.5, lineHeight: 1.5, color: "#111" },
  title: { fontSize: 16, textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 10, textAlign: "center", color: "#555", marginBottom: 18 },
  sectionHead: { fontSize: 12, marginTop: 14, marginBottom: 6 },
  para: { marginBottom: 6, textAlign: "justify" },
  clauseTitle: { fontSize: 11, marginTop: 10, marginBottom: 3 },
  schedule: { marginTop: 4, marginBottom: 4, paddingLeft: 8 },
  signRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 36 },
  signBox: { width: "45%" },
  signLine: { marginTop: 28, borderTopWidth: 1, borderTopColor: "#111", paddingTop: 4 },
  footer: { marginTop: 24, fontSize: 8.5, color: "#666" },
});

export interface PdfInput {
  data: AgreementData;
  orderId?: string;
  /** v1: "en" only. Phase 2: pass "gu" for the Gujarati template. */
  locale?: DocLocale;
}

/** Renders the full agreement as a react-pdf Document. */
export function AgreementPdf({ data, orderId, locale = "en" }: PdfInput) {
  const tpl = getAgreementTemplate(locale);
  const clauses = tpl.buildClauses(data);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{tpl.title}</Text>
        <Text style={styles.subtitle}>{tpl.subtitle(orderId)}</Text>

        <Text style={styles.sectionHead}>{tpl.partiesHead}</Text>
        <View style={styles.schedule}>
          <Text style={styles.para}>
            {tpl.partyLine(tpl.ownerLabel, data.ownerName, data.ownerFather, data.ownerAddress)}
          </Text>
          <Text style={styles.para}>
            {tpl.partyLine(tpl.tenantLabel, data.tenantName, data.tenantFather, data.tenantAddress)}
          </Text>
        </View>

        <Text style={styles.sectionHead}>{tpl.scheduleHead}</Text>
        <View style={styles.schedule}>
          <Text style={styles.para}>{data.propertyAddress}</Text>
          <Text style={styles.para}>{tpl.useLine(data.propertyUse)}</Text>
        </View>

        {clauses.map((c, i) => (
          <View key={i} wrap={false}>
            <Text style={styles.clauseTitle}>{tpl.clauseHead(i, c.title)}</Text>
            <Text style={styles.para}>{c.body}</Text>
          </View>
        ))}

        {data.specialClauses?.trim() ? (
          <View>
            <Text style={styles.clauseTitle}>{tpl.specialHead}</Text>
            <Text style={styles.para}>{data.specialClauses.trim()}</Text>
          </View>
        ) : null}

        <View style={styles.signRow}>
          <View style={styles.signBox}>
            <Text>{tpl.ownerSign}</Text>
            <Text style={styles.signLine}>{tpl.nameDate}</Text>
          </View>
          <View style={styles.signBox}>
            <Text>{tpl.tenantSign}</Text>
            <Text style={styles.signLine}>{tpl.nameDate}</Text>
          </View>
        </View>

        <View style={styles.signRow}>
          <View style={styles.signBox}>
            <Text>{tpl.witness(1)}</Text>
            <Text style={styles.signLine}>{tpl.nameSign}</Text>
          </View>
          <View style={styles.signBox}>
            <Text>{tpl.witness(2)}</Text>
            <Text style={styles.signLine}>{tpl.nameSign}</Text>
          </View>
        </View>

        <Text style={styles.footer}>{tpl.footer(data.startDate)}</Text>
      </Page>
    </Document>
  );
}
