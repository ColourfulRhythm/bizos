# Token Optimization & Folder-by-Folder Downloads

## Current Issues

1. **Token Waste:**
   - Creates fallback placeholders when documents fail (wastes tokens on failed attempts)
   - No validation before API calls
   - Retries create placeholders instead of skipping

2. **No Partial Downloads:**
   - ZIP only created at the end
   - Users can't download folders as they complete
   - All progress lost if generation fails

3. **Inefficient Flow:**
   - Generates all documents before allowing any download
   - No way to see progress per folder
   - Failed documents still consume tokens

## Optimizations to Implement

### 1. Remove Fallback Placeholders ✅
- **Current:** Creates placeholder docs when retries fail (lines 1803-1816, 1826-1836, 1878-1897)
- **New:** Skip failed documents, log them, continue with successful ones
- **Benefit:** No token waste on failed documents

### 2. Add Pre-API Validation ✅
- **Current:** Calls API without validation
- **New:** Validate business data completeness before API calls
- **Benefit:** Prevent unnecessary API calls

### 3. Incremental ZIP Generation ✅
- **Current:** ZIP created only at end (line 1936)
- **New:** Create ZIP after each folder completes
- **Benefit:** Users can download partial progress

### 4. Folder Download Buttons ✅
- **Current:** Only final download button
- **New:** Add download button for each completed folder
- **Benefit:** Users get value immediately

### 5. Skip Failed Documents ✅
- **Current:** Creates placeholders for failed docs
- **New:** Log failure, skip document, continue
- **Benefit:** No wasted tokens, faster generation

### 6. Better Error Handling ✅
- **Current:** Generic error messages
- **New:** Specific error types (API error, validation error, content error)
- **Benefit:** Better debugging, prevent retry loops

## Implementation Plan

### Phase 1: Remove Token Waste
1. Remove all fallback placeholder creation
2. Skip documents that fail after retries
3. Add validation before API calls
4. Log skipped documents clearly

### Phase 2: Incremental Downloads
1. Create ZIP after each folder
2. Store folder ZIPs in memory
3. Add download button in UI for each folder
4. Update final ZIP to include all folders

### Phase 3: UI Updates
1. Add folder completion indicators
2. Add download buttons per folder
3. Show skipped documents count
4. Better progress tracking

## Expected Results

- **Token Savings:** ~30-40% reduction (no placeholders, better validation)
- **User Experience:** Can download folders as they complete
- **Reliability:** Failed documents don't block progress
- **Transparency:** Clear logging of what succeeded/failed

