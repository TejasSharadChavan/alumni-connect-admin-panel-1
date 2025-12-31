# Resume Analysis Debug Guide

## "Failed to Analyze Resume" Error - Troubleshooting Steps

### 1. **Check OpenAI Connection**

First, verify that the OpenAI API is working:

**In Development Mode:**

- Look for the "Test OpenAI Connection" button in the resume analyzer
- Click it to verify the API connection is working
- Check browser console for any error messages

**Manual Test:**

- Visit: `http://localhost:3000/api/test-openai`
- Should return: `{"success": true, "openaiResponse": {...}}`

### 2. **Check Document Parsing**

Verify that your document can be parsed:

**In Development Mode:**

- Upload your resume file
- Click "Test Document Parsing" button
- Check the results for text extraction success

**Common Issues:**

- **PDF**: Image-based or scanned documents won't work
- **DOCX**: Corrupted files or complex formatting
- **DOC**: Limited support, try converting to DOCX or PDF

### 3. **Check Server Logs**

Look for detailed error messages in the server console:

```bash
# In your terminal where the dev server is running
# Look for messages like:
- "Processing PDF file: filename.pdf"
- "Successfully extracted X characters from PDF"
- "Starting AI analysis..."
- "AI analysis completed successfully"
```

### 4. **Common Error Patterns**

#### **JSON Parsing Errors**

```
Error: Failed to parse AI response. The AI returned invalid JSON format.
```

**Solution**: This is usually temporary. Try again in a few seconds.

#### **Missing Required Fields**

```
Error: AI response is missing required fields (summary or matchingScore)
```

**Solution**: The AI response was incomplete. Try again.

#### **Document Extraction Errors**

```
Error: No text content found in the PDF
```

**Solution**:

- Ensure PDF is text-based (not scanned)
- Try creating a new PDF from your word processor
- Use "Print to PDF" instead of "Save as PDF"

#### **OpenAI API Errors**

```
Error: No response from OpenAI
```

**Solution**:

- Check internet connection
- Verify OpenAI API key is valid
- Check OpenAI service status

### 5. **Step-by-Step Debugging**

#### Step 1: Verify Environment

```bash
# Check if OpenAI API key is set
echo $OPENAI_API_KEY
# Should show your API key (sk-...)
```

#### Step 2: Test Document Upload

1. Upload a simple PDF resume
2. Check browser Network tab for API calls
3. Look for `/api/resume/analyze` request
4. Check response for specific error messages

#### Step 3: Check File Format

- **Supported**: PDF, DOCX, DOC
- **File size**: Under 5MB
- **Content**: Text-based (not images)

#### Step 4: Test with Different Files

- Try a simple PDF created from Word
- Test with a DOCX file
- Use a minimal resume (1 page, simple formatting)

### 6. **Debug API Responses**

#### Successful Response Format:

```json
{
  "success": true,
  "analysis": {
    "summary": "...",
    "matchingScore": 85,
    "skillsMatch": ["skill1", "skill2"],
    "experienceMatch": "...",
    "strengths": ["..."],
    "weaknesses": ["..."],
    "recommendations": ["..."],
    "keyHighlights": ["..."]
  }
}
```

#### Error Response Format:

```json
{
  "error": "Specific error message",
  "code": "ERROR_CODE",
  "debug": {
    "textLength": 1234,
    "textPreview": "First 200 chars..."
  }
}
```

### 7. **Quick Fixes**

#### For PDF Issues:

1. **Recreate PDF**: Open resume in Word → Save As → PDF
2. **Use Print to PDF**: File → Print → Save as PDF
3. **Check text selection**: Open PDF, try to select text
4. **Reduce file size**: Compress if over 2MB

#### For DOCX Issues:

1. **Save as newer format**: Use .docx instead of .doc
2. **Remove complex formatting**: Simplify layout
3. **Check file integrity**: Open in Word to verify

#### For Analysis Issues:

1. **Try again**: Temporary API issues are common
2. **Simplify content**: Remove special characters
3. **Check job requirements**: Ensure job has skills listed
4. **Wait and retry**: Rate limiting may be in effect

### 8. **Error Code Reference**

| Code                         | Meaning                 | Solution                      |
| ---------------------------- | ----------------------- | ----------------------------- |
| `DOCUMENT_EXTRACTION_FAILED` | Can't read document     | Try different format          |
| `NO_TEXT_EXTRACTED`          | Empty or image-based    | Use text-based document       |
| `AI_ANALYSIS_FAILED`         | OpenAI processing error | Try again or check connection |
| `UNSUPPORTED_FORMAT`         | Wrong file type         | Use PDF, DOC, or DOCX         |
| `FILE_TOO_LARGE`             | File over 5MB           | Compress file                 |

### 9. **When to Contact Support**

Contact support if you experience:

- Consistent failures with multiple different PDF files
- OpenAI connection test fails repeatedly
- Error messages not covered in this guide
- Analysis works but returns obviously incorrect results

### 10. **Provide This Information**

When reporting issues, include:

- Exact error message
- File type and size
- Browser and version
- Whether OpenAI test passes
- Whether document parsing test passes
- Console error messages (if any)

## Quick Test Checklist

- [ ] OpenAI connection test passes
- [ ] Document parsing test shows extracted text
- [ ] File is under 5MB
- [ ] File is PDF, DOC, or DOCX format
- [ ] PDF contains selectable text (not scanned)
- [ ] Job posting has required skills listed
- [ ] Browser console shows no errors
- [ ] Internet connection is stable

If all items are checked and the issue persists, there may be a temporary service issue. Wait a few minutes and try again.
