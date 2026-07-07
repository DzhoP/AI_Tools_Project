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
            ['name' => 'Owner User',    'email' => 'owner@vibe.test',    'role' => 'owner'],
            ['name' => 'Backend Dev',   'email' => 'backend@vibe.test',  'role' => 'backend'],
            ['name' => 'Frontend Dev',  'email' => 'frontend@vibe.test', 'role' => 'frontend'],
            ['name' => 'Project Manager', 'email' => 'pm@vibe.test',     'role' => 'pm'],
            ['name' => 'QA Engineer',   'email' => 'qa@vibe.test',       'role' => 'qa'],
            ['name' => 'Designer',      'email' => 'designer@vibe.test', 'role' => 'designer'],
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
