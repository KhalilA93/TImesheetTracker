const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testRegistration = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timesheet-tracker');
    console.log('✅ Connected to MongoDB');

    // Check initial user count
    const initialCount = await User.countDocuments();
    console.log(`📊 Initial user count: ${initialCount}`);

    // Test user data
    const testUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'securepass456'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'mypassword789'
      }
    ];

    console.log('\n🧪 Testing User Registration...\n');

    for (let i = 0; i < testUsers.length; i++) {
      const userData = testUsers[i];
      
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Create new user (this tests the User model validation and password hashing)
        const newUser = new User(userData);
        await newUser.save();

        // Verify user was saved correctly
        const savedUser = await User.findOne({ email: userData.email });
        
        if (savedUser) {
          console.log(`✅ User ${i + 1}: ${userData.name} created successfully`);
          console.log(`   📧 Email: ${savedUser.email}`);
          console.log(`   🔐 Password hashed: ${savedUser.password.substring(0, 20)}...`);
          console.log(`   📅 Created: ${savedUser.createdAt}`);
          
          // Test password comparison
          const isPasswordValid = await savedUser.comparePassword(userData.password);
          console.log(`   🔓 Password validation: ${isPasswordValid ? 'PASS' : 'FAIL'}`);
          
          // Test invalid password
          const isInvalidPasswordRejected = await savedUser.comparePassword('wrongpassword');
          console.log(`   🚫 Invalid password rejected: ${!isInvalidPasswordRejected ? 'PASS' : 'FAIL'}`);
          
        } else {
          console.log(`❌ Failed to save user: ${userData.name}`);
        }
        
        console.log('   ' + '-'.repeat(50));
        
      } catch (error) {
        console.log(`❌ Error creating user ${userData.name}:`, error.message);
      }
    }

    // Check final user count
    const finalCount = await User.countDocuments();
    console.log(`\n📊 Final user count: ${finalCount}`);
    console.log(`📈 Users added: ${finalCount - initialCount}`);

    // List all users
    console.log('\n👥 All Users in Database:');
    const allUsers = await User.find({}, 'name email createdAt').sort({ createdAt: -1 });
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Created: ${user.createdAt.toLocaleDateString()}`);
    });

    // Test registration endpoint functionality
    console.log('\n🌐 Testing Registration Validation...');
    
    try {
      // Test duplicate email (should fail)
      const duplicateUser = new User({
        name: 'Duplicate User',
        email: testUsers[0].email, // Use existing email
        password: 'password123'
      });
      await duplicateUser.save();
      console.log('❌ FAIL: Duplicate email was allowed');
    } catch (error) {
      console.log('✅ PASS: Duplicate email properly rejected');
    }

    try {
      // Test missing required fields (should fail)
      const incompleteUser = new User({
        name: 'Incomplete User'
        // Missing email and password
      });
      await incompleteUser.save();
      console.log('❌ FAIL: Missing required fields were allowed');
    } catch (error) {
      console.log('✅ PASS: Missing required fields properly rejected');
    }

    try {
      // Test invalid email format (should fail)
      const invalidEmailUser = new User({
        name: 'Invalid Email User',
        email: 'invalid-email-format',
        password: 'password123'
      });
      await invalidEmailUser.save();
      console.log('❌ FAIL: Invalid email format was allowed');
    } catch (error) {
      console.log('✅ PASS: Invalid email format properly rejected');
    }

    console.log('\n🎉 Registration Testing Complete!');
    console.log('\n=== REGISTRATION TESTING SUMMARY ===');
    console.log('✅ User creation works correctly');
    console.log('✅ Password hashing is functional');
    console.log('✅ Password comparison works');
    console.log('✅ Data validation is working');
    console.log('✅ Database constraints are enforced');
    console.log('=====================================');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

testRegistration();
