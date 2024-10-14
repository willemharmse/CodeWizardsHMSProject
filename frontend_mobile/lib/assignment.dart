import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'submission.dart';
import 'package:universal_html/html.dart' as html;
import 'package:intl/intl.dart';

class AssignmentsScreen extends StatefulWidget {
  final String courseCode;
  final String username;

  const AssignmentsScreen({super.key, required this.courseCode, required this.username});

  @override
  State<AssignmentsScreen> createState() => _AssignmentsScreenState();
}

class _AssignmentsScreenState extends State<AssignmentsScreen> {
  List<dynamic> assignments = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchAssignments();
  }

  String? getToken() {
    return html.window.sessionStorage['token'];
  }

  // Fetch submissions for a specific assignment
  Future<void> fetchSubmission(String assignCode, String dueDate, String title) async {
    try {
      final token = getToken();
      if (token == null) {
        // Handle missing token
        return;
      }

      final response = await http.get(
        Uri.parse('http://10.0.2.2:5000/api/submission/${widget.username}/$assignCode'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        // Assuming the API returns a list of submissions, you can take the first one
        final submissionData = json.decode(response.body);

        if (submissionData is List && submissionData.isNotEmpty) {
          // Use the first submission from the list
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => SubmissionScreen(
                assingmentTitle: title,
                assignmentCode: assignCode,
                dueDate: dueDate,
                submission: submissionData[0], // Pass the first submission
              ),
            ),
          );
        } else {
          // Handle no submission case
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => SubmissionScreen(
                assingmentTitle: title,
                assignmentCode: assignCode,
                dueDate: dueDate,
              ),
            ),
          );
        }
      } else if (response.statusCode == 404) {
        // No submission found, navigate to submission creation screen
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => SubmissionScreen(
              assingmentTitle: title,
              assignmentCode: assignCode,
              dueDate: dueDate,
            ),
          ),
        );
      } else {
        print('Error fetching submission: ${response.statusCode}');
      }
    } catch (e) {
      print('Failed to load submission: $e');
    }
  }


  // Fetch assignments for the selected course
  Future<void> fetchAssignments() async {
    try {
      final token = getToken();
      if (token == null) {
        // Handle missing token
        return;
      }

      final response = await http.get(
        Uri.parse('http://10.0.2.2:5000/api/assignment/course/${widget.courseCode}'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        setState(() {
          assignments = json.decode(response.body);
          isLoading = false;
        });
      } else {
        setState(() {
          assignments = [];
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        assignments = [];
        isLoading = false;
      });
    }
  }

   @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Assignments for ${widget.courseCode}',
        style: TextStyle(color: Color.fromARGB(255, 0, 0, 0), fontWeight: FontWeight.w700, fontSize: 30),
        ),
        backgroundColor: Color.fromARGB(255, 175, 193, 208),
        elevation: 0,
      ),
      body: Container(
        decoration: BoxDecoration(
          color: Color.fromARGB(255, 175, 193, 208),
        ),
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : assignments.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.warning, size: 100, color: Color.fromARGB(255, 28, 63, 96)),
                        SizedBox(height: 20),
                        Text(
                          'No assignments available for this course.',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(height: 10),
                        Text(
                          'Please check back later.',
                          style: TextStyle(fontSize: 16),
                        ),
                      ],
                    ),
                  )
                : Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Color.fromARGB(255, 54, 86, 121),
                        borderRadius: BorderRadius.circular(16.0),
                        boxShadow: [
                          BoxShadow(
                            color: Color.fromARGB(255, 28, 63, 96).withOpacity(0.5),
                            spreadRadius: 5,
                            blurRadius: 10,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: ListView.builder(
                          itemCount: assignments.length,
                          itemBuilder: (context, index) {
                            final assignment = assignments[index];
                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 2.0),
                              child: Card(
                                elevation: 3.0,
                                color: Color.fromARGB(255, 28, 63, 96),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16.0),
                                ),
                                child: ListTile(
                                  title: Text(assignment['title'], style:TextStyle(color: Color.fromARGB(255, 243, 246, 250), fontWeight: FontWeight.w700) ,),
                                  subtitle: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(assignment['description'],style:TextStyle(color: Color.fromARGB(255, 243, 246, 250), fontWeight: FontWeight.w300)),
                                      Text(
                                        'Due Date: ${DateFormat('yyyy-MM-dd hh:mm a').format(
                                          DateTime.parse(assignment['dueDate']).subtract(const Duration(days: 1)).copyWith(hour: 23, minute: 59),
                                        )}',
                                        style:TextStyle(color: Color.fromARGB(255, 243, 246, 250), fontWeight: FontWeight.w300),
                                      ),
                                    ],
                                  ),
                                  onTap: () => fetchSubmission(
                                    assignment['assignCode'],
                                    assignment['dueDate'],
                                    assignment['title'],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  ),
      ),
    );
  }
}







