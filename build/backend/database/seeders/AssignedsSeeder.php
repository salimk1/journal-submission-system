<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssignedsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //
        DB::table('assigneds')->insert([
            'paper_id' => '1',
            'researcher_email' => 'researcher@mail.com',
            'reviewer_email' => 'reviewer@mail.com',
            'revision_deadline' => '2020-01-02'
        ]);

        DB::table('assigneds')->insert([
            'paper_id' => '2',
            'researcher_email' => 'researcher@mail.com',
            'reviewer_email' => 'reviewer1@mail.com',
            'revision_deadline' => '2020-01-02'
        ]);

        DB::table('assigneds')->insert([
            'paper_id' => '1',
            'researcher_email' => 'researcher1@mail.com',
            'reviewer_email' => 'reviewer1@mail.com',
            'revision_deadline' => '2020-01-02'
        ]);
    }
}
