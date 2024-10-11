import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dashboard.dart';
import 'package:universal_html/html.dart' as html;
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Login Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const LoginPage(),
    );
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isLoading = false;
  String _message = '';

  Future<void> _login() async {
    setState(() {
      _isLoading = true;
      _message = '';
    });

    String username = _usernameController.text;
    String password = _passwordController.text;

    var url = Uri.parse('http://10.0.2.2:5000/api/user/login'); // Update the URL as needed
    var body = jsonEncode({'username': username, 'password': password});

    try {
      var response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: body,
      );

      if (response.statusCode == 200) {
        // Parse the token from the response (assuming it's a JSON with a "token" field)
        var responseData = json.decode(response.body);
        String token = responseData['token'];

        final jwt = JWT.decode(token);
        String role = jwt.payload['role'];

        if (role == 'lecturer')
        {
          setState(() {
            _message = 'Login failed: Lecturers cannot access app.';
          });
        }
        else{
          // Store the token in sessionStorage
          html.window.sessionStorage['token'] = token;

          // Navigate to DashboardScreen
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => DashboardScreen(username: username),
            ),
          );
        }
      } else {
        // Handle error
        setState(() {
          _message = 'Login failed: ${response.body}';
        });
      }
    } catch (e) {
      setState(() {
        _message = 'Error: $e';
      });
    }

    setState(() {
      _isLoading = false;
    });
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
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Card(
              elevation: 8,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16.0),
              ),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Welcome Back',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.deepPurple,
                      ),
                    ),
                    const SizedBox(height: 20),
                    TextField(
                      controller: _usernameController,
                      decoration: InputDecoration(
                        labelText: 'Username',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12.0),
                          borderSide: const BorderSide(),
                        ),
                        filled: true,
                        fillColor: Colors.grey.shade200,
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _passwordController,
                      decoration: InputDecoration(
                        labelText: 'Password',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12.0),
                          borderSide: const BorderSide(),
                        ),
                        filled: true,
                        fillColor: Colors.grey.shade200,
                      ),
                      obscureText: true,
                    ),
                    const SizedBox(height: 20),
                    _isLoading
                        ? const CircularProgressIndicator()
                        : ElevatedButton(
                            onPressed: _login,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 40,
                                vertical: 15,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12.0),
                              ),
                            ),
                            child: const Text('Login'),
                          ),
                    const SizedBox(height: 20),
                    Text(
                      _message,
                      style: const TextStyle(color: Colors.red),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
