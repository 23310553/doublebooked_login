import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  GoogleSignIn _googleSignIn = GoogleSignIn(
  scopes: ['email'],
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
    GoogleSignInAccount? account = await _googleSignIn.signIn();
    GoogleSignInAuthentication authentication = await account!.authentication;
    String idToken = authentication.idToken!;
    
    // Now send this token to the Node.js server
    await _sendTokenToPocketbase(idToken);
  } catch (error) {
    print('Error signing in: $error');
  }
}

  Future<void> _handleSignOut() => _googleSignIn.disconnect();

  // This function will send the token to your Pocketbase instance
  Future<void> _sendTokenToPocketbase(String? idToken) async {
  if (idToken != null) {
    var response = await http.post(
      Uri.parse('https://3jx8jtwq-8090.uks1.devtunnels.ms/api/auth/google'),  // Replace with your actual server URL
      headers: {'Authorization': 'Bearer $idToken'},
    );
    if (response.statusCode == 200) {
      print('Successfully authenticated with Pocketbase');
    } else {
      print('Failed to authenticate: ${response.body}');
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
