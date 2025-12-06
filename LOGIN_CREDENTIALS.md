# 🔐 Login Credentials - Test Accounts

## ✅ All Passwords Reset Successfully

**Universal Password for ALL accounts:** `password123`

---

## 👨‍🎓 Student Accounts

| Email                              | Password      | Name         |
| ---------------------------------- | ------------- | ------------ |
| `aarav.sharma@terna.ac.in`         | `password123` | Aarav Sharma |
| `diya.patel@terna.ac.in`           | `password123` | Diya Patel   |
| `arjun.reddy@terna.ac.in`          | `password123` | Arjun Reddy  |
| `ananya.singh@terna.ac.in`         | `password123` | Ananya Singh |
| `vivaan.gupta@terna.ac.in`         | `password123` | Vivaan Gupta |
| `isha.mehta@terna.ac.in`           | `password123` | Isha Mehta   |
| `rahul.sharma@student.terna.ac.in` | `password123` | Rahul Sharma |
| `priya.patel@student.terna.ac.in`  | `password123` | Priya Patel  |

---

## 👨‍🏫 Alumni Accounts

| Email                             | Password      | Name          |
| --------------------------------- | ------------- | ------------- |
| `rahul.agarwal@gmail.com`         | `password123` | Rahul Agarwal |
| `meera.k@microsoft.com`           | `password123` | Meera K       |
| `vikrant@razorpay.com`            | `password123` | Vikrant       |
| `anjali.patil@swiggy.com`         | `password123` | Anjali Patil  |
| `sandeep@google.com`              | `password123` | Sandeep       |
| `alumni@test.com`                 | `password123` | Test Alumni   |
| `rajesh.mehta@alumni.terna.ac.in` | `password123` | Rajesh Mehta  |

---

## 👨‍💼 Faculty Accounts

| Email                      | Password      | Name         |
| -------------------------- | ------------- | ------------ |
| `prof.joshi@terna.ac.in`   | `password123` | Prof. Joshi  |
| `sanjay.nair@terna.ac.in`  | `password123` | Sanjay Nair  |
| `kavita.reddy@terna.ac.in` | `password123` | Kavita Reddy |
| `rahul.chopra@terna.ac.in` | `password123` | Rahul Chopra |
| `prof.verma@terna.ac.in`   | `password123` | Prof. Verma  |

---

## 👑 Admin Accounts

| Email                  | Password      | Name         |
| ---------------------- | ------------- | ------------ |
| `dean@terna.ac.in`     | `password123` | Dean         |
| `hod.comp@terna.ac.in` | `password123` | HOD Computer |

---

## 🚀 How to Login

1. **Start the dev server** (if not running):

   ```bash
   cd alumni-connect-admin-panel-1
   bun run dev
   ```

2. **Open browser**: `http://localhost:3000`

3. **Login with any account above**:
   - Email: (choose from table above)
   - Password: `password123`

4. **Click "Login"**

---

## ✅ Login Should Work Now

All users have:

- ✅ Status: `active` or `approved` (both allow login)
- ✅ Password: `password123` (freshly reset)
- ✅ Valid email addresses
- ✅ Proper roles assigned

---

## 🔍 If Login Still Fails

### Check Browser Console (F12)

Look for error messages that show:

- Network errors
- API response errors
- Authentication errors

### Common Issues:

#### 1. "Invalid credentials"

- **Cause**: Wrong email or password
- **Solution**: Use exact email from table above with `password123`

#### 2. "Account not active"

- **Cause**: User status is pending/rejected
- **Solution**: Already fixed - all users are active/approved

#### 3. "Failed to login" (generic)

- **Cause**: Server error or network issue
- **Solution**:
  - Check dev server is running
  - Check browser console for details
  - Check terminal for server errors

#### 4. Network Error

- **Cause**: Dev server not running
- **Solution**: Run `bun run dev`

---

## 🛠️ Reset Password for Specific User

If you need to reset a specific user's password:

```bash
bun run scripts/reset-password.ts <email> <new-password>
```

Example:

```bash
bun run scripts/reset-password.ts aarav.sharma@terna.ac.in myNewPassword123
```

---

## 🔄 Reset All Passwords Again

If you need to reset all passwords again:

```bash
bun run scripts/reset-all-test-passwords.ts
```

This will set all passwords back to `password123`

---

## 📝 Notes

- **Cookies cleared**: Not a problem - new session will be created on login
- **LocalStorage cleared**: Not a problem - auth token will be stored on login
- **All 37 users**: Have been updated with the new password
- **Password format**: Simple `password123` for easy testing

---

## ✅ Status

**Last Updated**: Just now
**Total Users**: 37
**Passwords Reset**: 37/37 ✅
**Ready to Login**: YES ✅

---

**Try logging in now with:**

- Email: `aarav.sharma@terna.ac.in`
- Password: `password123`

**It should work! 🎉**
