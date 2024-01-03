# Solution Code: Password Checker
# A program to check if a user's password matches the default password

# ----------------
# Constants
# ----------------
PASSWORD = "LetMeIn"

# ----------------
# Subprograms
# ----------------

def authenticate_user():
  authenticated = False
  while not authenticated:
    password_attempt = input("Enter password: ")
    if password_attempt == PASSWORD:
      authenticated = True
    else:
      print("Incorrect password.")

# ----------------
# Main program
# ----------------

print("Welcome to the Password Checker!")
authenticate_user()
print("Login successful.")


// typingOrder=1-6,8-12,21-25,7,13-20,26-29
// tabs=2
