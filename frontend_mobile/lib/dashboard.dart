import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'assignment.dart';
import 'dart:convert';
import 'package:universal_html/html.dart' as html;
import 'main.dart';

class DashboardScreen extends StatefulWidget {
  final String username;

  const DashboardScreen({super.key, required this.username});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<dynamic> courses = []; // Store courses here
  bool isLoading = true;      // Loading state

  @override
  void initState() {
    super.initState();
    fetchCourses();  // Fetch courses when the screen loads
  }

  // Function to get the token from sessionStorage
  String? getToken() {
    return html.window.sessionStorage['token'];
  }

  // Function to fetch courses from the API
  Future<void> fetchCourses() async {
    try {
      final token = getToken();
      if (token == null) {
        // Handle token being null (e.g., redirect to login)
        return;
      }

      final response = await http.get(
        Uri.parse('http://10.0.2.2:5000/api/course/courses/student'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        setState(() {
          courses = json.decode(response.body);  // Decode JSON
          isLoading = false;
        });
      } else {
        // Handle error response
        print('Error: ${response.statusCode}');
      }
    } catch (e) {
      print('Failed to load courses: $e');
    }
  }

  // Navigate to assignments when a course is tapped
  void onCourseTap(String courseCode) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => AssignmentsScreen(courseCode: courseCode, username: widget.username)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.deepPurple.shade300, Colors.deepPurple.shade900],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          children: [
            AppBar(
              title: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'HMS Submission App',
                    style: TextStyle(color: Color.fromARGB(255, 0, 0, 0), fontWeight: FontWeight.w700, fontSize: 30), // Set AppBar text color
                  ),
                  IconButton(
                    icon: const Icon(Icons.logout),
                    onPressed: () {
                      // Clear token from sessionStorage and navigate to login screen
                      html.window.sessionStorage.remove('token');
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(
                          builder: (context) => LoginPage(),
                        ),
                      );
                    },
                  ),
                ],
              ),
              backgroundColor: Colors.transparent, // Make AppBar background transparent
              elevation: 0, // Remove shadow
            ),
            Expanded(
              child: isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12.0),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.withOpacity(0.1),
                              spreadRadius: 2,
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: ListView.builder(
                            itemCount: courses.length,
                            itemBuilder: (context, index) {
                              final course = courses[index];
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4.0),
                                child: Card(
                                  elevation: 1.0,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12.0),
                                  ),
                                  child: ListTile(
                                    title: Text(
                                      '${course['courseCode']} - ${course['courseName']}',
                                      style: const TextStyle(color: Color.fromARGB(255, 82, 49, 138)), // Course name color
                                    ),
                                    onTap: () => onCourseTap(course['courseCode']),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
