import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
  scopes: ['email'],
  serverClientId: '771472830027-ls01kb7d3c8alfump1ppfi4so723cvun.apps.googleusercontent.com',
);
  GoogleSignInAccount? _currentUser;

  @override
  void initState() {
    super.initState();
    _googleSignIn.onCurrentUserChanged.listen((GoogleSignInAccount? account) {
      setState(() {
        _currentUser = account;
      });
    });
    _googleSignIn.signInSilently();
  }

 Future<void> _handleSignIn() async {
  try {
    final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

    if (googleUser == null) {
      print("Sign-in canceled by user.");
      return; // User canceled the sign-in
    }

    if (googleUser != null) {
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      if (googleAuth == null || googleAuth.idToken == null) {
        print("Error: googleAuth or idToken is null");
        return;
      }

      print("Google User: ${googleUser.email}");
      
      // Call the _sendTokenToPocketbase method to send the token to your Pocketbase API
      await _sendTokenToPocketbase(googleAuth.idToken);

    } else {
      print("Error: googleUser is null");
    }

  } catch (error) {
    print("Error signing in: $error");
  }
}

  Future<void> _handleSignOut() => _googleSignIn.disconnect();

  // This function will send the token to your Pocketbase instance
  Future<void> _sendTokenToPocketbase(String? idToken) async {
  if (idToken != null) {
    var response = await http.post(
      Uri.parse('https://19s674wc.uks1.devtunnels.ms:3000/api/auth/google'),  // Replace with your actual server URL
      headers: {'Authorization': 'Bearer $idToken'},
    );
    if (response.statusCode == 200) {
      print('Successfully authenticated with Pocketbase');
    } else {
      print('Failed to authenticate: ${response.statusCode} - ${response.body}');
    }
  }
}

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: Text('Google Sign-In with Pocketbase'),
        ),
        body: Center(
          child: _currentUser == null
              ? ElevatedButton(
                  onPressed: _handleSignIn,
                  child: Text('Sign in with Google'),
                )
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Signed in as ${_currentUser!.displayName}'),
                    ElevatedButton(
                      onPressed: _handleSignOut,
                      child: Text('Sign out'),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}


void main() => runApp(MyApp());
