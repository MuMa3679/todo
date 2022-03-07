# [Amplify] vue3で簡単なTodoサービスの作成

## はじめに
[前回](https://qiita.com/MuMa3679/items/feca880700d49cb6d476)にAmplifyを用いた認証画面までをまとめたので、今回は認証機能を持ったTodoサービスを作成したのでソースコードの公開などをし、まとめる。

## 環境
```
bootstrap5
@vue/cli: 4.5.15
amplify cli: 7.6.19
```

## バックエンドの作成
Amplifyでバックエンドを作成していく。
今回使うバックエンドリソースは
* Auth(Cognito)
* API(Graphql)

のみである。

## vue3のプロジェクトの開始
通常通りVueのプロジェクトを作成する。

```
$ vue create todo
.
.
.

cd test
```

### Amplifyの初期化
Initに関しては[前回](https://qiita.com/MuMa3679/items/feca880700d49cb6d476)まとめているので、こちらを参照してください。

### Auth
Authに関しては[前回](https://qiita.com/MuMa3679/items/feca880700d49cb6d476)まとめているので、こちらを参照してください。

### API
今回はの開発ではAPIはGraphQLを使用した。
AmplifyでAPI設定をすると自動でDynamoDBにテーブルが作成される。

```
$ amplify add api
? Select from one of the below mentioned services: GraphQL

# ここの設定は自分の環境に合わせて設定してください。
Here is the GraphQL API that we will create. Select a setting to edit or continue (Use arrow keys)
  Name: todo
  Authorization modes: Amazon Cognito User Pool (default)
  Conflict detection (required for DataStore): Disabled

? Here is the GraphQL API that we will create. Select a setting to edit or continue Continue
? Choose a schema template: Blank Schema
✔ Do you want to edit the schema now? (Y/n) · yes
? Try opening with system-default editor instead? Yes
```

ここまで設定できましたら、`amplify/backend/api/`というフォルダが作成されていますので、作成されていましたら成功です。

次に`amplify/backend/api/schema.graphql`を編集します。
このファイルはDynamoDBのモデルを作成したり、QueryやMutationを設定したりできますので、いろいろ触ってみると良いかと思います。
今回はTodoのため、一つのモデルを作成します。

```amplify/backend/api/schema.graphql
type Todo 
@model
@auth(rules: [
    { allow: owner },
])
{
    id: ID!
    name: String!
    description: String
    completed: Boolean!
}
```

基本的にチュートリアルと同じですが、いくつか追加している部分があるので、解説します。
```
@auth(rules: [
    { allow: owner },
])
```
この設定ですが、Authでログインしているユーザーのみが見れるような設定となります。
例えば他のユーザーが作成したTodoを見ることは出来ません。
また、ログインしていない場合は権限がないため、見ることが出来ません。

```
completed: Boolean!
```
今回のTodoは完了した場合はそのフラグを設定しますので、一つフィールドを追加しています。

その他の書き方として、左の項目にフィールド名 : をはさんだ右側に型を設定します。
! は入力必須項目を意味します。この ! がない場合は空でも入力可ということになります。

## 変更適応
記入したら変更を適応します。

```
$ amplify push -y
.
.
.
```

## vueの設定
前回の認証画面にbootstrapと新たにTodoページを追加しました。

```todo/src/App.vue
<template>
  <div>
    <amplify-authenticator>
      <Todo />
      <div class="row justify-content-evenly">
        <div class="col-4">
          <amplify-sign-out></amplify-sign-out>
        </div>
      </div>
    </amplify-authenticator>
  </div>

</template>

<script>
import Auth from 'aws-amplify'
import Todo from './components/Todo.vue'

export default {
  name: 'App',
  components: {
    Todo
  },
}
</script>
```

todoのコンポーネントは以下の通りです。
```src/components/todo.vue
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
```

ログインユーザーは前回同様にCognitoのコンソールより手動で作ります。

上記ソースコードより、Todoを入力し、それをリスト表示し、完了したら完了場所に移動し、完了場所のTodoは削除することができる。という簡単なTodoサービスを作成しました。

```
import * as gqlQueries from "@/graphql/queries.js";
import * as gqlMutations from "@/graphql/mutations.js";
```
この部分に関しましてですが、
```
"@/graphql/queries.js";
"@/graphql/mutations.js";
```
プッシュ時にモデルに`@model`をつけることで上記二つのファイルが作成されます。
GraphQLは本来は自分でクエリ文を作成する必要がありますが、Amplifyがこれを自動で作成してくれます。そのため引数を渡すだけで簡単にGraphQLを実行することが出来ます。
ただ、これを使用すると全てのデータを取ってしまうのでこれを使わずにクエリを作成することも出来ます。

## 最後に
今回はソースコードを多めに張ってしまいました。
こちらの記事もどんどん更新していけたらと思っています。
準備が出来ましたら全てのソースコードの公開が出来ればと思います。

またより良い方法などがある場合はコメント等でお願いたします。