import { userService } from './server/services/user.service'
import { decryptPassword } from './server/utils/crypto'
import { encryptPassword } from './app/utils/crypto'

async function runTests() {
    console.log('--- Starting User Service Tests ---')

    try {
        // 1. Test Login with plain text (compatibility)
        console.log('Test 1: Login with existing user (e.g., admin)...')
        const admin = await userService.authenticate('admin', 'password123')
        if (admin) {
            console.log('✅ Success: Admin authenticated')
        } else {
            console.log('❌ Failed: Admin login failed')
        }

        // 2. Test Encryption/Decryption flow
        console.log('Test 2: Encryption Flow...')
        const rawPass = 'test-pass-123'
        const encrypted = encryptPassword(rawPass)
        const decrypted = decryptPassword(encrypted)

        if (rawPass === decrypted) {
            console.log('✅ Success: Encryption/Decryption match')
        } else {
            console.log('❌ Failed: Password mismatch after decryption')
        }

        // 3. Test Create User through Service (Hashed)
        console.log('Test 3: Creating a new user via Service...')
        const uniqueEmail = `test-${Date.now()}@example.com`
        const newUser = await userService.createUser({
            username: `testuser_${Date.now()}`,
            email: uniqueEmail,
            password: 'securePassword',
            name: 'Test Runner',
            role: 'USER'
        })
        console.log(`✅ Success: User created with ID: ${newUser.id}`)

        // 4. Test Authenticating the new Hashed User
        console.log('Test 4: Authenticating the newly hashed user...')
        const authResult = await userService.authenticate(newUser.username, 'securePassword')
        if (authResult) {
            console.log('✅ Success: Hashed user authenticated correctly')
        } else {
            console.log('❌ Failed: Could not authenticate user with hashed password')
        }

        // 5. Clean up
        console.log('Test 5: Cleaning up test user...')
        await userService.deleteUser(newUser.id)
        console.log('✅ Success: Test user deleted')

    } catch (error) {
        console.error('❌ Test execution error:', error)
    }

    console.log('--- Tests Finished ---')
}

runTests()
