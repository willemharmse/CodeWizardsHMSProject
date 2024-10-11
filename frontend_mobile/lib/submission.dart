import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:http/http.dart' as http;
import 'package:universal_html/html.dart' as html;

class SubmissionScreen extends StatefulWidget {
  final String assignmentCode;
  final String dueDate;
  final Map<String, dynamic>? submission;

  const SubmissionScreen({
    Key? key,
    required this.dueDate,
    required this.assignmentCode,
    this.submission,
  }) : super(key: key);

  @override
  _SubmissionScreenState createState() => _SubmissionScreenState();
}

class _SubmissionScreenState extends State<SubmissionScreen> {
  PlatformFile? pickedFile;

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
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('File submitted successfully!')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to submit file. Please try again.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('An error occurred. Please try again.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    DateTime dueDate = DateTime.parse(widget.dueDate);
    bool isPastDueDate = DateTime.now().isAfter(dueDate);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Submit Assignment'),
        centerTitle: true,
        backgroundColor: Colors.teal,
        elevation: 4,
      ),
      body: Container(
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.teal.shade100, Colors.teal.shade300],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: widget.submission == null
            ? SingleChildScrollView(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    const SizedBox(height: 30),
                    if (isPastDueDate)
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.redAccent,
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
                        'Submit your assignment for ${widget.assignmentCode}',
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
                          leading: const Icon(Icons.upload_file, color: Colors.teal),
                          title: const Text('Upload your file'),
                          trailing: ElevatedButton.icon(
                            onPressed: pickFile,
                            icon: const Icon(Icons.attach_file),
                            label: const Text('Select File'),
                            style: ElevatedButton.styleFrom(
                              //primary: Colors.teal.shade400,
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
                            leading: const Icon(Icons.insert_drive_file, color: Colors.teal),
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
                          child: const Text('Submit Assignment'),
                          style: ElevatedButton.styleFrom(
                            //primary: Colors.green.shade400,
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
              )
            : Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.check_circle, color: Colors.green, size: 100),
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
                      'Mark: ${widget.submission!['grade'] ?? 0}',
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
