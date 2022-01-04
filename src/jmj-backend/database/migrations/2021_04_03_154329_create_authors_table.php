<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAuthorsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('authors', function (Blueprint $table) {
            $table->id();
            $table->string('author');
            $table->unsignedBigInteger('paper_id');   
            $table->string('researcher_email');
            $table->timestamps();

            // foreign key
            $table->foreign('paper_id')->references('id')->on('papers')->onUpdate('cascade')
            ->onDelete('cascade');
            $table->foreign('researcher_email')->references('email')->on('users')->onUpdate('cascade')
            ->onDelete('cascade');

            // primary
            $table->index(['author', 'paper_id', 'researcher_email']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('authors');
    }
}
