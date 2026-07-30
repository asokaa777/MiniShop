<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', Password::min(8)],
            'phone'    => 'nullable|string|max:20',
        ]);

        $user  = User::create([...$validated, 'role' => 'customer']);
        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'user'  => $this->userPayload($user),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        // Revoke previous tokens to prevent unbounded growth
        $user->tokens()->delete();
        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'user'  => $this->userPayload($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request)
    {
        return response()->json($this->userPayload($request->user()));
    }

    /**
     * Called by mobile after Google/Facebook OAuth completes on-device.
     * The mobile SDK handles the OAuth flow and sends us the provider token.
     * We verify it server-side by fetching the user from the provider.
     */
    public function socialLogin(Request $request, string $provider)
    {
        $this->validateProvider($provider);

        $request->validate(['token' => 'required|string']);

        try {
            $socialUser = Socialite::driver($provider)
                ->stateless()
                ->userFromToken($request->token);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Gagal memverifikasi token ' . ucfirst($provider) . ': ' . $e->getMessage(),
            ], 400);
        }

        $email = $socialUser->getEmail();
        if (! $email) {
            return response()->json(['message' => 'Email dari akun ' . ucfirst($provider) . ' tidak ditemukan.'], 400);
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name'        => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                'avatar'      => $socialUser->getAvatar(),
                'provider'    => $provider,
                'provider_id' => $socialUser->getId(),
                'role'        => 'customer',
            ]
        );

        $user->tokens()->delete();
        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'user'  => $this->userPayload($user),
            'token' => $token,
        ]);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private function userPayload(User $user): array
    {
        return [
            'id'     => $user->id,
            'name'   => $user->name,
            'email'  => $user->email,
            'role'   => $user->role,
            'avatar' => $user->avatar,
            'phone'  => $user->phone,
        ];
    }

    private function validateProvider(string $provider): void
    {
        if (! in_array($provider, ['google', 'facebook'])) {
            abort(400, 'Unsupported provider.');
        }
    }
}
