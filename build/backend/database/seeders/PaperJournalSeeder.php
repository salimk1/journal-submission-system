<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaperJournalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('paper_journals')->insert([
            'paper_id' => 1,
            'journal_id' => 1
        ]);

        DB::table('paper_journals')->insert([
            'paper_id' => 2,
            'journal_id' => 1
        ]);

        DB::table('paper_journals')->insert([
            'paper_id' => 3,
            'journal_id' => 2
        ]);

        DB::table('paper_journals')->insert([
            'paper_id' => 4,
            'journal_id' => 2
        ]);
    }
}
