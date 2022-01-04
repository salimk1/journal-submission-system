<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePapersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('papers', function (Blueprint $table) {
            $table->id();
            $table->string('title'); 
            $table->set('status', ['pending_assignment','pending_revision', 'pending_publication', 'published'])
                    ->default('pending_assignment');
            $table->string('file_path');
            $table->string('researcher_email');
            $table->string('editor_email')->nullable();
            $table->string('em_name')->nullable();
            $table->timestamps();

            //
            $table->foreign('researcher_email')->references('email')->on('users')->onUpdate('cascade')
            ->onDelete('cascade');
            $table->foreign('editor_email')->references('email')->on('users')->onUpdate('cascade')
            ->onDelete('cascade');
            $table->foreign('em_name')->references('name')->on('evaluation_metrics')->onUpdate('cascade')
            ->onDelete('cascade');
            
            $table->index(['id', 'researcher_email']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('papers');
    }
}
