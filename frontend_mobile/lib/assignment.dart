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
  Future<void> fetchSubmission(String assignCode, String dueDate) async {
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
        print('Error fetching assignments: ${response.statusCode}');
      }
    } catch (e) {
      print('Failed to load assignments: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Assignments for ${widget.courseCode}'),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),  // Padding for the outer container
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,  // Background color for the box
                  borderRadius: BorderRadius.circular(16.0),  // Rounded corners for the box
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.2),  // Shadow color
                      spreadRadius: 5,
                      blurRadius: 10,
                      offset: const Offset(0, 8),  // Changes position of shadow
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),  // Padding inside the box
                  child: ListView.builder(
                    itemCount: assignments.length,
                    itemBuilder: (context, index) {
                      final assignment = assignments[index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 2.0),  // Space between cards
                        child: Card(
                          elevation: 3.0,  // Adds shadow below each card
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16.0),  // Rounded corners for cards
                          ),
                        child: ListTile(
                          title: Text(assignment['title']),  // Display assignment title
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(assignment['description']),  // Display assignment description
                              Text(
                                'Due Date: ${DateFormat('yyyy-MM-dd hh:mm a').format(
                                  DateTime.parse(assignment['dueDate']).subtract(Duration(days: 1)).copyWith(
                                    hour: 23,
                                    minute: 59,
                                  )
                                )}',  // Format and display due date as one day before at 11:59 PM
                              ),
                            ],
                          ),
                          onTap: () => fetchSubmission(assignment['assignCode'], assignment['dueDate']),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),
    );
  }
}
