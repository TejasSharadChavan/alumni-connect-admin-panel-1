# Resume Analysis Troubleshooting Guide

## Common Issues and Solutions

### 1. "Unable to parse data from resume" Error

This error typically occurs when the system cannot extract readable text from your PDF file. Here are the most common causes and solutions:

#### **Cause: Image-based PDF (Scanned Resume)**

- **Problem**: Your resume is a scanned image or photo saved as PDF
- **Solution**:
  - Recreate your resume using a word processor (Microsoft Word, Google Docs, etc.)
  - Save/export as PDF directly from the word processor
  - Avoid scanning physical documents

#### **Cause: Corrupted PDF File**

- **Problem**: The PDF file is damaged or corrupted
- **Solution**:
  - Try opening the PDF in a PDF viewer to verify it works
  - Recreate the PDF from your original document
  - Use "Print to PDF" feature instead of "Save as PDF" if issues persist

#### **Cause: Password-Protected PDF**

- **Problem**: The PDF has security restrictions
- **Solution**:
  - Remove password protection before uploading
  - Create a new PDF without security restrictions

#### **Cause: Complex Formatting or Graphics**

- **Problem**: Heavy graphics, complex layouts, or special fonts
- **Solution**:
  - Use a simpler, text-based resume template
  - Avoid heavy graphics, watermarks, or complex layouts
  - Stick to standard fonts (Arial, Times New Roman, Calibri)

### 2. "No text content found" Error

#### **Cause: Empty or Minimal Content**

- **Problem**: PDF contains very little readable text
- **Solution**:
  - Ensure your resume has sufficient text content
  - Check that text is not embedded as images
  - Verify the PDF displays text when opened normally

### 3. Low Match Scores

#### **Understanding the Scoring System**

The AI uses a weighted scoring algorithm:

- **Skills Match (40%)**: Matching technical and soft skills
- **Experience Relevance (30%)**: Work experience alignment
- **Education/Qualifications (15%)**: Educational background fit
- **Achievements/Projects (15%)**: Notable accomplishments

#### **Improving Your Score**

1. **Include Relevant Keywords**: Use terms from the job description
2. **Highlight Matching Skills**: Clearly list technical skills that match requirements
3. **Quantify Achievements**: Use numbers and metrics where possible
4. **Relevant Experience**: Emphasize experience related to the job role
5. **Clear Formatting**: Use bullet points and clear section headers

### 4. Analysis Takes Too Long

#### **Typical Processing Time**

- PDF parsing: 1-3 seconds
- AI analysis: 5-15 seconds
- Total time: Usually under 20 seconds

#### **If Analysis Hangs**

1. Check your internet connection
2. Try refreshing the page and uploading again
3. Ensure the PDF file size is under 5MB
4. Try a different PDF file to test

### 5. File Upload Issues

#### **Supported File Types**

- ✅ PDF files only (currently)
- ❌ DOC/DOCX support coming soon
- ❌ Images (JPG, PNG) not supported

#### **File Size Limits**

- Maximum size: 5MB
- Recommended: Under 2MB for faster processing

#### **File Format Best Practices**

- Use standard PDF format
- Avoid password protection
- Keep file size reasonable
- Use text-based content (not images)

## Testing Your Resume

### Debug Mode (Development Only)

In development mode, you'll see a "Test PDF Parsing" button that helps diagnose issues:

1. **Upload your resume**
2. **Click "Test PDF Parsing"**
3. **Review the results**:
   - ✅ Success: Shows extracted text preview and word count
   - ❌ Failure: Shows specific error and suggestions

### What Good Results Look Like

- **Text Length**: 500+ characters
- **Word Count**: 100+ words
- **Preview**: Shows readable resume content
- **No Errors**: Clean extraction without issues

## Creating an AI-Friendly Resume

### ✅ Best Practices

1. **Use Standard Templates**: Simple, professional layouts
2. **Clear Section Headers**: Education, Experience, Skills, etc.
3. **Bullet Points**: Easy-to-parse formatting
4. **Standard Fonts**: Arial, Calibri, Times New Roman
5. **Text-Based Content**: Avoid images for important information
6. **Keyword Rich**: Include relevant industry terms
7. **Quantified Achievements**: Use numbers and percentages

### ❌ Avoid These

1. **Complex Graphics**: Heavy design elements
2. **Scanned Documents**: Image-based PDFs
3. **Unusual Fonts**: Decorative or custom fonts
4. **Text in Images**: Important info as graphics
5. **Password Protection**: Security restrictions
6. **Excessive Length**: Keep under 3 pages
7. **Poor Quality Scans**: Blurry or low-resolution text

## API Error Codes Reference

| Error Code              | Meaning                       | Solution                        |
| ----------------------- | ----------------------------- | ------------------------------- |
| `PDF_EXTRACTION_FAILED` | Cannot extract text from PDF  | Try a different PDF file        |
| `NO_TEXT_EXTRACTED`     | PDF contains no readable text | Use text-based PDF, not scanned |
| `PDF_REQUIRED`          | Wrong file type uploaded      | Upload PDF file only            |
| `FILE_TOO_LARGE`        | File exceeds 5MB limit        | Compress or recreate PDF        |
| `INVALID_FILE_TYPE`     | Unsupported file format       | Use PDF format only             |
| `ANALYSIS_FAILED`       | AI analysis error             | Try again or contact support    |

## Getting Help

### Self-Diagnosis Steps

1. **Test with a simple resume**: Create a basic text resume to test
2. **Check file properties**: Ensure it's a real PDF, not renamed image
3. **Try different browsers**: Sometimes browser-specific issues occur
4. **Clear browser cache**: Remove cached data and try again

### When to Contact Support

- Consistent failures with multiple PDF files
- Error messages not covered in this guide
- Analysis results seem completely incorrect
- System performance issues

### Information to Provide

When reporting issues, include:

- Error message (exact text)
- File size and type
- Browser and version
- Steps you tried
- Whether it works with other PDF files

## Advanced Tips

### For Recruiters/Alumni

- Review AI analysis alongside manual evaluation
- Use score ranges rather than exact numbers for filtering
- Consider context: some roles may need different weighting
- Provide feedback to improve the system

### For Students

- Test your resume before important applications
- Use the analysis to improve your resume content
- Focus on matching job requirements and keywords
- Keep multiple versions for different job types

## Technical Details

### PDF Processing

- Uses `pdf-parse` library for text extraction
- Supports standard PDF 1.4+ formats
- Handles most common PDF creators
- Optimized for text-based documents

### AI Analysis

- Powered by OpenAI GPT-4o-mini
- Professional HR-focused prompts
- Structured analysis with consistent scoring
- Contextual evaluation based on job requirements

### Security

- Files processed securely on server
- No permanent storage of resume content
- Analysis data encrypted in database
- Privacy-compliant processing
