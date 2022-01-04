<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class NominatedReviewersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // add nominees
        DB::table('nominated_reviewers')->insert([
            'paper_id' => '1',
            'researcher_email' => 'researcher@mail.com',
            'reviewer_email' => 'reviewer1@mail.com'
        ]);

        // add nominees
        DB::table('nominated_reviewers')->insert([
            'paper_id' => '1',
            'researcher_email' => 'researcher@mail.com',
            'reviewer_email' => 'reviewer2@mail.com'
        ]);
    }
}
