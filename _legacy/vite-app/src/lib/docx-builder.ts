import JSZip from 'jszip';

function escapeXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapParagraphs(text: string, isMainSection = false): string {
  if (!text) return '';
  return text
    .split('\n')
    .filter((l) => l.trim())
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        const content = trimmed.replace(/^[•\-]\s*/, '');
        return `<w:p>
        <w:pPr><w:ind w:left="560" w:hanging="280"/><w:spacing w:before="60" w:after="60"/></w:pPr>
        <w:r><w:rPr><w:color w:val="C8963E"/></w:rPr><w:t xml:space="preserve">◆  </w:t></w:r>
        <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>${escapeXml(content)}</w:t></w:r>
      </w:p>`;
      }
      return `<w:p>
      <w:pPr>
        <w:spacing w:before="${isMainSection ? '120' : '100'}" w:after="${isMainSection ? '120' : '100'}" w:line="276" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="22"/></w:rPr>
        <w:t xml:space="preserve">${escapeXml(line)}</w:t>
      </w:r>
    </w:p>`;
    })
    .join('');
}

const docxNamespaces =
  'xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mo="http://schemas.microsoft.com/office/mac/office/2008/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:mv="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14"';

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="200" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Normal">
    <w:name w:val="Normal"/><w:qFormat/>
    <w:pPr><w:spacing w:after="200" w:line="276" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>
    <w:pPr><w:keepNext/><w:spacing w:before="480" w:after="0" w:line="276" w:lineRule="auto"/><w:outlineLvl w:val="0"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:b/><w:bCs/><w:sz w:val="32"/><w:szCs w:val="32"/><w:color w:val="1A3C5E"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>
    <w:pPr><w:keepNext/><w:spacing w:before="240" w:after="0" w:line="276" w:lineRule="auto"/><w:outlineLvl w:val="1"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:b/><w:bCs/><w:sz w:val="28"/><w:szCs w:val="28"/><w:color w:val="2C3E50"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>
    <w:pPr><w:keepNext/><w:spacing w:before="200" w:after="0" w:line="276" w:lineRule="auto"/><w:outlineLvl w:val="2"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:b/><w:bCs/><w:sz w:val="24"/><w:szCs w:val="24"/><w:color w:val="34495E"/></w:rPr>
  </w:style>
</w:styles>`;

export interface PlanSection {
  title?: string;
  content?: string;
}

export interface DocSection {
  heading?: string;
  content?: string;
}

export interface PlanDoc {
  sections?: PlanSection[];
}

export interface Doc {
  title?: string;
  filename?: string;
  sections?: DocSection[];
}

export interface BizData {
  name?: string;
  industry?: string;
  [key: string]: unknown;
}

export async function buildBusinessPlanDocxBlob(planDoc: PlanDoc, biz: BizData): Promise<Blob> {
  const sections = (planDoc.sections || []).map((section, idx) => {
    const isFirst = idx === 0;
    const headingLevel = isFirst ? 'Heading1' : 'Heading2';
    return `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="${headingLevel}"/>
        <w:spacing w:before="${isFirst ? '360' : '280'}" w:after="120"/>
        ${isFirst ? '<w:keepNext/>' : ''}
        <w:borderBetween w:val="single" w:sz="6" w:space="1" w:color="C8963E"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="${isFirst ? '32' : '28'}"/><w:color w:val="${isFirst ? '1A3C5E' : '2C3E50'}"/></w:rPr>
        <w:t>${escapeXml(section.title || '')}</w:t>
      </w:r>
    </w:p>
    ${wrapParagraphs(section.content || '', true)}`;
  }).join('');

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document ${docxNamespaces}>
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/><w:spacing w:before="0" w:after="180"/><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="1A3C5E"/></w:rPr><w:t>${escapeXml(biz.name || '')}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:before="0" w:after="360"/><w:jc w:val="center"/><w:borderBetween w:val="single" w:sz="12" w:space="1" w:color="C8963E"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="C8963E"/></w:rPr><w:t>Comprehensive Business Plan</w:t></w:r>
    </w:p>
    ${sections}
    <w:p>
      <w:pPr><w:spacing w:before="480"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="18"/><w:color w:val="999999"/><w:i/></w:rPr>
        <w:t>Generated by BizOS · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</w:t>
      </w:r>
    </w:p>
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
  </w:body>
</w:document>`;

  const zip = new JSZip();
  zip.file('word/document.xml', docXml);
  zip.file('word/styles.xml', stylesXml);
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

export async function buildDocxBlob(doc: Doc, biz: BizData): Promise<Blob> {
  const sections = (doc.sections || []).map((s, idx) => {
    const isFirst = idx === 0;
    const headingLevel = isFirst ? 'Heading1' : 'Heading2';
    return `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="${headingLevel}"/>
        <w:spacing w:before="${isFirst ? '360' : '280'}" w:after="120"/>
        ${isFirst ? '<w:keepNext/>' : ''}
        <w:borderBetween w:val="single" w:sz="6" w:space="1" w:color="C8963E"/>
      </w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="${isFirst ? '32' : '28'}"/><w:color w:val="${isFirst ? '1A3C5E' : '2C3E50'}"/></w:rPr>
        <w:t>${escapeXml(s.heading || '')}</w:t>
      </w:r>
    </w:p>
    ${wrapParagraphs(s.content || '', true)}`;
  }).join('');

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document ${docxNamespaces}>
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/><w:spacing w:before="0" w:after="180"/><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="1A3C5E"/></w:rPr><w:t>${escapeXml(doc.title || '')}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:before="0" w:after="360"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="18"/><w:color w:val="999999"/></w:rPr>
        <w:t>${escapeXml(biz.name || '')} · ${escapeXml(biz.industry || '')}</w:t>
      </w:r>
    </w:p>
    ${sections}
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
  </w:body>
</w:document>`;

  const zip = new JSZip();
  zip.file('word/document.xml', docXml);
  zip.file('word/styles.xml', stylesXml);
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}
