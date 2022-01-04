<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateJournalsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('journals', function (Blueprint $table) {
            $table->id();       
            $table->string('title');                // Title
            $table->date('published_date');         // Published Date
            $table->set('status', ['pending', 'approved', 'rejected']);
            $table->timestamps();                   // Journals[created_On, last_Updated]
            $table->string('admin_email');
            $table->string('editor_email');

            // foreign
            $table->foreign('admin_email')->references('email')->on('users')->onUpdate('cascade')
            ->onDelete('cascade');
            $table->foreign('editor_email')->references('email')->on('users')->onUpdate('cascade')
            ->onDelete('cascade');

            // unique title and 'published_date'
            $table->index(['title', 'published_date'], 'journal_index');
        });
    }

    /**
     * Reverse the migrations.
     *
     * this drops the table
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('journals');
    }
}
