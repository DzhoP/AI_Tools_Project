<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $roles = DB::table('roles')->pluck('id', 'name');

        $users = [
            ['name' => 'Иван Попов',        'email' => 'owner@vibe.test',    'role' => 'owner'],
            ['name' => 'Георги Веселинов',  'email' => 'backend@vibe.test',  'role' => 'backend'],
            ['name' => 'Елена Проданова',   'email' => 'frontend@vibe.test', 'role' => 'frontend'],
            ['name' => 'Симеон Стефанов',   'email' => 'pm@vibe.test',       'role' => 'pm'],
            ['name' => 'Виктор Павлов',     'email' => 'qa@vibe.test',       'role' => 'qa'],
            ['name' => 'Ралица Калева',     'email' => 'designer@vibe.test', 'role' => 'designer'],
        ];

        foreach ($users as $user) {
            DB::table('users')->insertOrIgnore([
                'name'       => $user['name'],
                'email'      => $user['email'],
                'password'   => Hash::make('password'),
                'role_id'    => $roles[$user['role']],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
