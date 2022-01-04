<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JournalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('journals')->insert([
            'title' => 'Journal 2',
            'published_date' => '2021-03-14',
            'status' => 'approved',
            'admin_email' => 'admin@mail.com',
            'editor_email' => 'editor@mail.com'
        ]);

        DB::table('journals')->insert([
            'title' => 'Journal 3',
            'published_date' => '2021-04-03',
            'status' => 'approved',
            'admin_email' => 'admin@mail.com',
            'editor_email' => 'editor@mail.com'
        ]);

        DB::table('journals')->insert([
            'title' => 'Journal 4',
            'published_date' => '2021-04-13',
            'status' => 'pending',
            'admin_email' => 'admin@mail.com',
            'editor_email' => 'editor@mail.com'
        ]);
    }
}
