<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh-right" @click="handleRefresh">
        刷新
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="id" align="center" width="60">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="应用" width="80" align="center">
        <template slot-scope="{row}">
          <span>{{ row.app }}</span>
        </template>
      </el-table-column>
      <el-table-column label="场景" min-width="100px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.case_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="场景描述" min-width="120px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.case_desc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="60">
        <template slot-scope="{row}">
          <span>{{ statusOptions[row.status].label }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结果" min-width="100" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.result }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否问题" class-name="status-col" width="80">
        <template slot-scope="{row}">
          <span v-if="row.is_problem==1">
            <i class="el-icon-warning-outline" style="color:red;font-size: 20px" />
          </span>
          <span v-if="row.is_problem==0">
            ---
          </span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="100" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.note }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="90" align="center">
        <template slot-scope="{row}">
          <span>{{ row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成时间" align="center" width="90px">
        <template slot-scope="{row}">
          <span>{{ row.finish_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="编辑" align="center" width="80" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="查看" align="center" width="80" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <router-link :to="'/testing/detail/'+scope.row.id">
            <el-button type="primary" size="mini">
              查看
            </el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>

    <!-- <pagination v-show="total>0" :total="total"  @pagination="getList" /> -->

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="应用" prop="app">
          <el-input v-model="temp.app" />
        </el-form-item>
        <el-form-item label="场景" prop="case_name">
          <el-input v-model="temp.case_name" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" />
        </el-form-item>
        <el-form-item label="描述" prop="case_desc">
          <el-input v-model="temp.case_desc" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="caseStatus" class="filter-item">
            <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="结果">
          <el-input v-model="temp.result" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" />
        </el-form-item>
        <el-form-item label="是否问题">
          <el-select v-model="caseIsProblem" class="filter-item">
            <el-option v-for="item in problemOptions" :key="item.key" :label="item.label" :value="item.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.note" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button v-if="dialogStatus==='update'" type="danger" @click="handleDelete()">
          Delete
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import { fetchTestingCaseList, createTestingCase, updateTestingCase, deleteTestingCase } from '@/api/testing'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'TestingCases',
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      statusOptions: [{ label: '待处理', key: '0', colr: 'blue' }, { label: '进行中', key: '1', colr: 'orange' }, { label: '阻塞', key: '2', colr: 'red' }, { label: '完成', key: '3', colr: 'green' }],
      problemOptions: [{ label: '否', key: '0' }, { label: '是', key: '1' }],
      showReviewer: false,
      temp: {
        id: undefined,
        app: '',
        case_name: '',
        case_desc: '',
        status: 0,
        result: '',
        is_problem: 0,
        note: '',
        create_time: '',
        finish_time: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '更新',
        create: '创建'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        // app: [{ required: true, message: 'app is required', trigger: 'change' }],
        // case_name: [{ required: true, message: 'case name is required', trigger: 'change' }],
        // case_desc: [{ required: true, message: 'case desc is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      caseStatus: '待处理',
      caseIsProblem: '否'
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchTestingCaseList().then(response => {
        this.list = response.data
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1 * 1000)
      })
    },
    handleFilter() {
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        app: '',
        case_name: '',
        case_desc: '',
        status: 0,
        result: '',
        is_problem: 0,
        note: '',
        create_time: '',
        finish_time: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.caseStatus = ''
      this.caseIsProblem = ''
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      var statusindex = this.statusOptions.findIndex(v => v.label === this.caseStatus)
      var problemindex = this.problemOptions.findIndex(v => v.label === this.caseIsProblem)
      if (statusindex === -1) {
        statusindex++
      }
      if (problemindex === -1) {
        problemindex++
      }
      this.temp.status = parseInt(this.statusOptions[statusindex].key)
      this.temp.is_problem = parseInt(this.problemOptions[problemindex].key)
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createTestingCase(this.temp).then((response) => {
            this.temp.id = response.data.id
            this.temp.create_time = response.data.create_time
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '创建成功！',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.caseStatus = this.statusOptions[row.status].label
      this.caseIsProblem = this.problemOptions[row.is_problem].label
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      var statusindex = this.statusOptions.findIndex(v => v.label === this.caseStatus)
      var problemindex = this.problemOptions.findIndex(v => v.label === this.caseIsProblem)
      this.temp.status = parseInt(this.statusOptions[statusindex].key)
      this.temp.is_problem = parseInt(this.problemOptions[problemindex].key)
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateTestingCase(tempData).then((response) => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.temp.finish_time = response.data.finish_time
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '更新成功！',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete() {
      deleteTestingCase(this.temp.id).then((response) => {
        const index = this.list.findIndex(v => v.id === this.temp.id)
        this.list.splice(index, 1)
        this.dialogFormVisible = false
        this.$notify({
          title: 'Success',
          message: '删除成功！',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleRefresh() {
      this.getList()
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
