import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:http/http.dart' as http;
import 'package:universal_html/html.dart' as html;

class SubmissionScreen extends StatefulWidget {
  final String assignmentCode;
  final String assingmentTitle;
  final String dueDate;
  final Map<String, dynamic>? submission;

  const SubmissionScreen({
    Key? key,
    required this.dueDate,
    required this.assingmentTitle,
    required this.assignmentCode,
    this.submission,
  }) : super(key: key);

  @override
  _SubmissionScreenState createState() => _SubmissionScreenState();
}

class _SubmissionScreenState extends State<SubmissionScreen> {
  PlatformFile? pickedFile;
  bool? _isSubmissionSuccess;
  String? _submissionMessage;

  Future<void> pickFile() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles();
      if (result != null) {
        setState(() {
          pickedFile = result.files.first;
        });
      }
    } catch (e) {
      print("Error picking file: $e");
    }
  }

  String? getToken() {
    return html.window.sessionStorage['token'];
  }

  Future<void> submitFile() async {
    if (pickedFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a file before submitting.')),
      );
      return;
    }

    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('http://10.0.2.2:5000/api/submission/submit'),
      );

      request.fields['assignCode'] = widget.assignmentCode;
      request.files.add(await http.MultipartFile.fromPath(
        'file',
        pickedFile!.path!,
      ));

      String? token = await getToken();
      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      var response = await request.send();

      if (response.statusCode == 200) {
        setState(() {
          _isSubmissionSuccess = true;
          _submissionMessage = 'File submitted successfully!';
        });
      } else {
        setState(() {
          _isSubmissionSuccess = false;
          _submissionMessage = 'Failed to submit file. Please try again.';
        });
      }
    } catch (e) {
      setState(() {
        _isSubmissionSuccess = false;
        _submissionMessage = 'An error occurred. Please try again.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    DateTime dueDate = DateTime.parse(widget.dueDate);
    bool isPastDueDate = DateTime.now().isAfter(dueDate);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Submit Assignment',
        style: TextStyle(color: Color.fromARGB(255, 0, 0, 0), fontWeight: FontWeight.w700, fontSize: 30),
        ),
        backgroundColor: Color.fromARGB(255, 175, 193, 208),
        elevation: 0,
      ),
      body: Container(
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          color: Color.fromARGB(255, 175, 193, 208),
        ),
        child: _isSubmissionSuccess != null
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      _isSubmissionSuccess! ? Icons.check_circle : Icons.error,
                      color: _isSubmissionSuccess! ? Colors.green : Colors.red,
                      size: 100,
                    ),
                    const SizedBox(height: 20),
                    Text(
                      _submissionMessage!,
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: _isSubmissionSuccess! ? Colors.green : Colors.red,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              )
              : widget.submission == null
                  ? Center(
                      child: SingleChildScrollView(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(height: 30),
                            if (isPastDueDate)
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: Color.fromARGB(255, 28, 63, 96),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Text(
                                  'Assignment due date has passed.',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 20,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              )
                            else ...[
                              Text(
                                'Submit your assignment for: ${widget.assingmentTitle}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 24,
                                  color: Colors.black,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 20),
                              Card(
                                elevation: 4,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(15),
                                ),
                                child: ListTile(
                                  leading: const Icon(Icons.upload_file, color: Color.fromARGB(255, 28, 63, 96)),
                                  title: const Text('Upload your file'),
                                  trailing: ElevatedButton.icon(
                                    onPressed: pickFile,
                                    icon: const Icon(Icons.attach_file, color: Color.fromARGB(255, 28, 63, 96)),
                                    label: const Text('Select File', style:TextStyle(color: Color.fromARGB(255, 28, 63, 96))),
                                    style: ElevatedButton.styleFrom(
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(30),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 20),
                              if (pickedFile != null)
                                Card(
                                  elevation: 4,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                  child: ListTile(
                                    leading: const Icon(Icons.insert_drive_file, color: Color.fromARGB(255, 28, 63, 96)),
                                    title: Text(
                                      'File selected: ${pickedFile!.name}',
                                      style: const TextStyle(fontSize: 16),
                                    ),
                                  ),
                                ),
                              const SizedBox(height: 20),
                              if (pickedFile != null)
                                ElevatedButton(
                                  onPressed: submitFile,
                                  child: const Text('Submit Assignment', style:TextStyle(color: Color.fromARGB(255, 28, 63, 96))),
                                  style: ElevatedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(30.0),
                                    ),
                                  ),
                                ),
                            ],
                            const SizedBox(height: 20), // Added space to avoid screen cut-off
                          ],
                        ),
                      ),
                    )

                : Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.check_circle, color: Color.fromARGB(255, 28, 63, 96), size: 100),
                        const SizedBox(height: 20),
                        const Text(
                          'Submission Details:',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          'Mark: ${widget.submission!['grade'] ?? 'Not graded yet'}',
                          style: const TextStyle(fontSize: 18, color: Colors.black),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'Feedback: ${widget.submission!['feedback'] ?? 'No feedback'}',
                          style: const TextStyle(fontSize: 18, color: Colors.black),
                        ),
                      ],
                    ),
                  ),
      ),
    );
  }
}
