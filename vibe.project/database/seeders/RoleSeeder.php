<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'owner',     'label' => 'Owner'],
            ['name' => 'backend',   'label' => 'Backend Developer'],
            ['name' => 'frontend',  'label' => 'Frontend Developer'],
            ['name' => 'pm',        'label' => 'Project Manager'],
            ['name' => 'qa',        'label' => 'QA Engineer'],
            ['name' => 'designer',  'label' => 'Designer'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->insertOrIgnore($role);
        }
    }
}
