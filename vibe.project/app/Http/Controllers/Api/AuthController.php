<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\TwoFactorCodeMail;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    const SELF_REGISTERABLE_ROLES = ['backend', 'frontend', 'pm', 'qa', 'designer'];

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Грешен имейл или парола.'],
            ]);
        }

        $code = (string) random_int(100000, 999999);

        $user->forceFill([
            'two_factor_code'       => $code,
            'two_factor_expires_at' => now()->addMinutes(10),
        ])->save();

        Mail::to($user->email)->send(new TwoFactorCodeMail($code));

        return response()->json([
            'two_factor_required' => true,
            'email'               => $user->email,
            // Само за демо/прототип: в local среда кодът се връща директно,
            // за да не се рови в лог файла. В production това поле НЕ трябва да съществува.
            'demo_code'           => app()->isLocal() ? $code : null,
        ]);
    }

    public function verifyTwoFactor(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'code'  => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        // hash_equals = сравнение с постоянно време, не издава информация чрез скоростта на отговора
        $invalid = ! $user
            || ! $user->two_factor_code
            || ! hash_equals($user->two_factor_code, $request->code)
            || ! $user->two_factor_expires_at
            || $user->two_factor_expires_at->isPast();

        if ($invalid) {
            throw ValidationException::withMessages([
                'code' => ['Невалиден или изтекъл код.'],
            ]);
        }

        $user->forceFill([
            'two_factor_code'       => null,
            'two_factor_expires_at' => null,
        ])->save();

        $token = $user->createToken('next-app')->plainTextToken;

        return response()->json([
            'user'  => $user->load('role'),
            'token' => $token,
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $allowedRoleIds = Role::whereIn('name', self::SELF_REGISTERABLE_ROLES)->pluck('id');

        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role_id'  => ['required', Rule::in($allowedRoleIds)],
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role_id'  => $request->role_id,
        ]);

        $token = $user->createToken('next-app')->plainTextToken;

        return response()->json([
            'user'  => $user->load('role'),
            'token' => $token,
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Излязохте успешно.']);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'current_password' => ['required_with:password', 'nullable', 'current_password'],
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return response()->json($user->load('role'));
    }
}
