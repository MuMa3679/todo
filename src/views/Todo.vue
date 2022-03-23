<template>
    <div>
        <modalDescription :isVisible="openModalDescription" :todo="selectingTodo" @closeModal="closeModal" @deleteTodo="deleteTodo" />
    </div>
    <div>
        <h1 class="h1 text-center">やることリスト</h1>
        <div class="row justify-content-center">
            <div class="col-4">
                <label for="nameText" class="form-label text-right">名前</label>
                <input type="text" v-model="todo.name" class="form-control mb-3" id="nameText">
                <label for="descriptionArea" class="form-label">内容</label>
                <textarea v-model="todo.description" class="form-control mb-1" rows="3" placeholder="するべきことを入力してください" id="descriptionArea"></textarea>
                <div class="d-grid gap-2 d-md-flex justify-content-md-end mb-3">
                    <button type="button" class="btn btn-primary" @click="createTodo">追加</button>
                </div>
            </div>
        </div>
        
        <div class="row justify-content-center">
            <div class="mb-3 col-4">
                <div class="h3 text-center">実行中</div>
                <div id="help" class="form-text">ダブルクリックで詳細を表示します。</div>
                <draggable v-model="todos" group="todos" item-key="id" handle=".handle" :options="{group:'TODOS'}" @add="notCompletedTodo">
                    <template #item="{element}">
                        <div v-if="!element.completed">
                            <div id="todo" class="handle drag-item border border-primary" @dblclick="openModal" @mousedown="selectTodo(element)">{{ element.description }}</div>
                        </div>
                    </template>
                </draggable>
            </div>
            
            <div class="mb-3 col-4">
                <div class="h3 text-center">完了済み</div>
                <div id="help" class="form-text">ダブルクリックで詳細を表示します。</div>
                <draggable v-model="todos" group="todos" item-key="id" handle=".handle" :options="{group:'TODOS'}" @add="completedTodo">
                    <template #item="{element}">
                        <div class="" v-if="element.completed">
                            <div id="todo" class="handle drag-item border border-primary" @dblclick="openModal" @mousedown="selectTodo(element)">{{ element.description }}</div>
                        </div>
                    </template>
                </draggable>
            </div>
        </div>

    </div>
</template>

<script>
import { API } from 'aws-amplify'
import * as gqlQueries from "@/graphql/queries.js";
import * as gqlMutations from "@/graphql/mutations.js";
import draggable from "vuedraggable";

import modalDescription from "@/components/ModalDescription.vue";

export default {
    name: 'Todo',
    components: {
        draggable,
        modalDescription,
    },
    data() {
        return {
            selectingTodo: null,
            openModalDescription: false,
            todos: [],
            todo: {
                name: null,
                description: null,
                completed: false,
            }
        }
    },

    created(){
        this.getTodos()
    },

    methods: {
        async getTodos(){
            const todos = await API.graphql({
                query: gqlQueries.listTodos
            })
            this.todos = todos.data.listTodos.items
        },

        async createTodo(){
            await API.graphql({
                query: gqlMutations.createTodo,
                variables: {input: this.todo}}
            ).then(
                response => {
                    let todo = response.data.createTodo
                    this.todos = [...this.todos, todo]
                }
            ).catch(
                error => {
                    console.error(error)
                }
            )
        },

        selectTodo(todo){
            this.selectingTodo = todo
        },

        closeModal(){
            this.openModalDescription = false;
        },

        openModal(){
            this.openModalDescription = true;
        },

        async notCompletedTodo(){
            const updateTodo = {
                id: this.selectingTodo.id,
                name: this.selectingTodo.name,
                description: this.selectingTodo.description,
                completed: false
            }

            await this.updateTodo(updateTodo)
        },

        async completedTodo(){
            const updateTodo = {
                id: this.selectingTodo.id,
                name: this.selectingTodo.name,
                description: this.selectingTodo.description,
                completed: true
            }

            await this.updateTodo(updateTodo)
        },

        async updateTodo(updateTodo){
            await API.graphql({
                query: gqlMutations.updateTodo,
                variables: {input: updateTodo}}
            ).then(
                response => {
                    let todo = response.data.updateTodo
                    this.todos = this.todos.filter(td => td.id != todo.id)
                    this.todos = [...this.todos, todo];
                }
            ).catch(
                error => {
                    console.error(error)
                }
            )
        },

        async deleteTodo(todoId){
            const deleteTodoInput = {
                id: todoId
            }

            await API.graphql({
                query: gqlMutations.deleteTodo,
                variables: {input: deleteTodoInput}}
            ).then(
                response => {
                    let todo = response.data.deleteTodo
                    this.todos = this.todos.filter(td => td.id != todo.id)
                    if(this.openModalDescription){
                        this.openModalDescription = false;
                    }
                }
            ).catch(
                error => {
                    console.error(error)
                }
            )
        },
    }
}
</script>

<style scoped>
.drag-item {
    background: rgb(233, 249, 255);
    margin: 10px 0;
    padding: 10px;
}

#todo {
    cursor: pointer
}
</style>
