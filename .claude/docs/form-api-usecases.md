# CUSTOM FORM API USE CASES

## USE CASE 1: Admin Updates Draft Form and Adds Questions

Step 1: Get the current draft form Endpoint: GET
/programs/{program_id}/forms/draft Auth: Superadmin Input: program_id in path
Output: { id: number, programId: number, name: string, version: "" (empty string
means draft), createdAt: timestamp, updatedAt: timestamp, questions: [array of
questions with nested subQuestions] }

Step 2: Update form name (optional) Endpoint: PUT /programs/{program_id}/forms
Auth: Superadmin Input: Path: program_id Body: { name: "Updated Form Name" }
Output: { message: "Form updated successfully", form: { id, programId, name,
version: "", createdAt, updatedAt } }

Step 3: Add a new question Endpoint: POST /programs/{program_id}/forms/questions
Auth: Superadmin Input: Path: program_id Body: { parentId: null (or question_id
for nested question), label: "What is the patient age?", type: "number",
required: true, options: null (or ["option1", "option2"] for select/radio),
order: 1 } Output: { message: "Question created successfully", question: { id:
number, formId: number, parentId: null or number, label: string, type: string,
required: boolean, options: array or null, order: number, createdAt: timestamp,
updatedAt: timestamp } }

Step 4: Update an existing question Endpoint: PUT
/programs/{program_id}/forms/questions/{question_id} Auth: Superadmin Input:
Path: program_id, question_id Body: { label: "Updated question text", required:
false, order: 2 } Output: { message: "Question updated successfully", question:
{ id, formId, parentId, label, type, required, options, order, createdAt,
updatedAt } }

Step 5: Delete a question Endpoint: DELETE
/programs/{program_id}/forms/questions/{question_id} Auth: Superadmin Input:
program_id, question_id in path Output: { message: "Question deleted
successfully" }

## USE CASE 2: Admin Publishes Form

Step 1: Publish the draft form with a version number Endpoint: POST
/programs/{program_id}/forms/publish Auth: Superadmin Input: Path: program_id
Body: { version: "v1.0" } Output: { message: "Form published successfully",
form: { id: number (new form id), programId: number, name: string, version:
"v1.0", createdAt: timestamp, updatedAt: timestamp } } Note: This creates a NEW
form with the published version. The draft remains unchanged.

Step 2: Set the published version as the program's current form Endpoint: PUT
/programs/{program_id} Auth: Admin Input: Path: program_id Body: { formVersion:
"v1.0" } Output: { message: "Program updated successfully", program: { id, name,
country, formVersion: "v1.0", createdAt, updatedAt } }

## USE CASE 3: Admin Checks Out Published Form to Draft

Step 1: Checkout a published version to draft for editing Endpoint: POST
/programs/{program_id}/forms/{version}/checkout Auth: Superadmin Input: Path:
program_id, version (e.g., "v1.0") Body: (empty) Output: { message: "Draft
updated from published form", form: { id: number (draft form id), programId:
number, name: string, version: "" (draft), createdAt: timestamp, updatedAt:
timestamp, questions: [array of cloned questions with nested subQuestions] } }
Note: This loads the published version into the draft. Existing draft questions
are replaced.

## USE CASE 4: Developer Submits Form Answers for a Session

Step 1: Get the current form for the program Endpoint: GET
/programs/{program_id}/forms/current Auth: Any authenticated user Input:
program_id in path Output: { id: number, programId: number, name: string,
version: string (the current published version), createdAt: timestamp,
updatedAt: timestamp, questions: [array of questions with nested subQuestions] }
Note: Returns the form version set in program.formVersion, or latest published
if null.

Step 2: Submit answers for a session Endpoint: POST
/sessions/{session_id}/forms/answers Auth: User with write access to session
Input: Path: session_id Body: { answers: [ { questionId: number, value: any
(string, number, array, object), dataType: "string" | "number" | "boolean" |
"array" | "object" }, ... ] } Output: { message: "Form answers created
successfully", answers: [ { id: number, sessionId: number, formId: number,
questionId: number, value: any, dataType: string, submittedAt: timestamp,
createdAt: timestamp, updatedAt: timestamp }, ... ] } Note: Uses the program's
current published form. Draft forms cannot be used for answers.

Step 3: Update existing answers Endpoint: PUT
/sessions/{session_id}/forms/answers Auth: User with write access to session
Input: Path: session_id Body: { answers: [ { questionId: number, value: any,
dataType: string }, ... ] } Output: { message: "Form answers updated
successfully", answers: [array of updated answer objects] }

## USE CASE 5: Admin Gets Form Answers for a Session

Step 1: Get answers for the current form version Endpoint: GET
/sessions/{session_id}/forms/answers Auth: User with read access to session
Input: Path: session_id Query: (none - uses current form) Output: { formId:
number, formName: string, formVersion: string, programId: number, sessionId:
number, answers: [ { id: number, questionId: number, parentId: null or number,
label: string, type: string, required: boolean, options: array or null, value:
any, dataType: string, submittedAt: timestamp, createdAt: timestamp, updatedAt:
timestamp }, ... ] }

Step 2: Get answers for a specific form version Endpoint: GET
/sessions/{session_id}/forms/answers?version=v1.0 Auth: User with read access to
session Input: Path: session_id Query: version=v1.0 Output: Same as Step 1, but
for the specified version

## USE CASE 6: Admin Exports Form Answers as CSV

Step 1: Export all form answers Endpoint: GET /sessions/export/forms/csv Auth:
Admin Input: Query parameters (all optional): startDate: ISO date string
endDate: ISO date string programId: number programCountry: string version:
string (specific form version) Output: CSV file with headers: Answer ID, Session
ID, Session Frontend ID, Site ID, Site Name, Program ID, Program Name, Form ID,
Form Name, Form Version, Question ID, Question Label, Question Type, Answer
Value, Data Type, Submitted At

Step 2: Export answers for specific version Endpoint: GET
/sessions/export/forms/csv?version=v1.0&programId=5 Auth: Admin Input: Query:
version=v1.0, programId=5 Output: CSV file filtered by version and program

## USE CASE 7: Admin Views All Form Versions

Step 1: List all forms for a program Endpoint: GET /programs/{program_id}/forms
Auth: Superadmin Input: program_id in path Output: { forms: [ { id: number,
programId: number, name: string, version: string ("" for draft, "v1.0" etc for
published), createdAt: timestamp, updatedAt: timestamp }, ... ] }

Step 2: Get a specific form version with questions Endpoint: GET
/programs/{program_id}/forms/{version} Auth: Superadmin Input: Path: program_id,
version (e.g., "v1.0" or "draft") Output: { id: number, programId: number, name:
string, version: string, createdAt: timestamp, updatedAt: timestamp, questions:
[array of questions with nested subQuestions] }

## IMPORTANT NOTES

1. Draft forms have version = "" (empty string)
2. Published forms have version = "v1.0", "v2.0", etc (any non-empty string)
3. Only draft forms can be modified (update name, add/edit/delete questions)
4. Publishing creates a NEW form with a new ID and the specified version
5. Checkout loads a published version into the draft (replaces draft content)
6. Only published forms can be used for recording answers
7. Program.formVersion points to the currently active form version
8. If formVersion is null, the latest published form is used
9. Draft forms cannot be deleted (one draft per program always exists)
10. When getting answers without specifying version, uses program's current form
