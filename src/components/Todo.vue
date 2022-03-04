<template>
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
            <div id="help" class="form-text">ダブルクリックで完了にします。</div>
            <ul class="list-group">
                <div v-for="todo in todos" :key="todo.id">
                    <li class="list-group-item list-group-item-action" v-if="!todo.completed" @dblclick="completedTodo(todo)">{{todo.name}}({{todo.description}})</li>
                </div>
            </ul>
        </div>
        <div class="mb-3 col-4">
            <div class="h3 text-center">完了済み</div>
            <div id="help" class="form-text">ダブルクリックで削除します。</div>
            <ul class="list-group">
                <div v-for="todo in todos" :key="todo.id">
                    <li class="list-group-item list-group-item-action" v-if="todo.completed" @dblclick="deleteTodo(todo.id)">{{todo.name}}({{todo.description}})</li>
                </div>
            </ul>
        </div>
    </div>
  </div>
</template>

<script>
import { API } from 'aws-amplify'
import * as gqlQueries from "@/graphql/queries.js";
import * as gqlMutations from "@/graphql/mutations.js";

export default {
    name: 'Todo',
    data() {
        return {
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

        async completedTodo(todo){
            const updateTodo = {
                id: todo.id,
                name: todo.name,
                description: todo.description,
                completed: true
            }

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
                }
            ).catch(
                error => {
                    console.error(error)
                }
            )
        }
    }
}
</script>