<template>
  <div class="app-container">
    <div style="margin:0 0 10px 20px">
      Testing Case Detail: {{ caseName }}
      <el-button type="primary" size="mini" @click="handleCreate()">添加</el-button>
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
      <el-table-column label="环境信息" min-width="120px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.env }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结果" min-width="120px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.result }}</span>
        </template>
      </el-table-column>
      <el-table-column label="测试时间" width="90px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.test_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" class-name="status-col" min-width="100" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.note }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否有效" class-name="status-col" width="80">
        <template slot-scope="{row}">
          <span>
            <i v-if="row.is_validate==1" class="el-icon-check" style="color:green;font-size: 20px" />
            <i v-if="row.is_validate==0" class="el-icon-close" style="color:red;font-size: 20px" />
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            <i class="el-icon-edit" />
          </el-button>
          <el-button type="primary" size="mini" @click="handleCheckFile(row)">
            <i class="el-icon-files" />
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            <i class="el-icon-delete" />
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- <pagination v-show="total>0" :total="total"  @pagination="getList" /> -->

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="环境信息">
          <el-input v-model="temp.env" type="textarea" :autosize="{ minRows: 2, maxRows: 10}" />
        </el-form-item>
        <el-form-item label="测试结果" prop="result">
          <el-input v-model="temp.result" type="textarea" :autosize="{ minRows: 2, maxRows: 10}" />
        </el-form-item>
        <el-form-item label="测试时间" prop="test_time">
          <el-date-picker v-model="temp.test_time" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.note" type="textarea" :autosize="{ minRows: 2, maxRows: 10}" />
        </el-form-item>
        <el-form-item label="是否有效">
          <el-select v-model="detailValidate" class="filter-item">
            <el-option v-for="item in validateOptions" :key="item.key" :label="item.label" :value="item.label" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogFileVisible" title="文件列表">
      <el-table :data="fileData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="文件">
          <template slot-scope="{row}">
            <span>{{ row.file_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pv" label="操作">
          <template slot-scope="{row}">
            <a :href="geturl(row)">
              <el-button type="primary" size="mini">
                <i class="el-icon-download" />
              </el-button>
            </a>
            <el-button type="danger" size="mini" style="margin-left: 10px;" @click="handleDeleteFile(row)">
              <i class="el-icon-delete" />
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-upload :action="uploadUrl" :headers="myHeader" :on-success="uploadFileSuccess" :show-file-list="false" style="display: inline-block;margin-right: 10px;">
          <el-button type="primary" size="mini">
            <i class="el-icon-upload2" />
          </el-button>
        </el-upload>
        <el-button type="primary" size="mini" @click="dialogFileVisible = false">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import { getTestingCaseDetail, createTestingCaseDetail, updateTestingCaseDetail, deleteTestingCaseDetail, deleteTestingCaseDetailFile, downloadTestingCaseDetailFile } from '@/api/testing'
import waves from '@/directive/waves' // waves directive

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
      list: [],
      caseName: '',
      caseId: 0,
      caseDetailId: 0,
      total: 0,
      caseDetail: undefined,
      listLoading: true,
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      validateOptions: [{ label: '无效', key: '0' }, { label: '有效', key: '1' }],
      showReviewer: false,
      temp: {
        id: undefined,
        env: '',
        result: '',
        test_time: '',
        note: '',
        is_validate: 1
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '更新',
        create: '创建'
      },
      dialogFileVisible: false,
      fileData: [],
      rules: {
        // app: [{ required: true, message: 'app is required', trigger: 'change' }],
        // caseName: [{ required: true, message: 'case name is required', trigger: 'change' }],
        // case_desc: [{ required: true, message: 'case desc is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      uploadUrl: '',
      myHeader: {
        'X-Session-Id': localStorage.getItem('X-Session-Id')
      },
      detailValidate: ''
    }
  },
  created() {
    const id = this.$route.params && this.$route.params.id
    this.fetchData(id)
  },
  methods: {
    fetchData(id) {
      this.temp.caseId = id
      this.listLoading = true
      getTestingCaseDetail(id).then(response => {
        this.list = response.data.case_details
        this.caseName = response.data.case_name
        this.caseId = parseInt(id)
        this.caseDetail = response.data
        // this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1 * 1000)
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        env: '',
        result: '',
        test_time: '',
        note: '',
        is_validate: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.detailValidate = ''
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      var validateindex = this.validateOptions.findIndex(v => v.label === this.detailValidate)
      if (validateindex === -1) {
        validateindex++
      }
      this.temp.is_validate = validateindex
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.case_id = this.caseId
          createTestingCaseDetail(this.temp).then((response) => {
            this.temp.id = response.data.id
            this.list.push(this.temp)
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
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.detailValidate = this.validateOptions[row.is_validate].label
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      var validateindex = this.validateOptions.findIndex(v => v.label === this.detailValidate)
      this.temp.is_validate = validateindex
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.case_id = this.caseId
          const tempData = Object.assign({}, this.temp)
          updateTestingCaseDetail(tempData).then((response) => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
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
    handleDelete(row) {
      deleteTestingCaseDetail(row.id).then((response) => {
        const index = this.list.findIndex(v => v.id === row.id)
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
    handleCheckFile(row) {
      this.caseDetailId = row.id
      this.dialogFileVisible = true
      const index = this.caseDetail.case_details.findIndex(v => v.id === row.id)
      this.fileData = this.caseDetail.case_details[index].detail_file
      this.uploadUrl = process.env.VUE_APP_BASE_API + '/api/test/cases/detail/' + row.id + '/upload'
    },
    // TODO
    handleDownload(row) {
      downloadTestingCaseDetailFile(row.id).then(() => {
        console.log('download success.')
      })
    },
    handleDeleteFile(row) {
      deleteTestingCaseDetailFile(row.id).then(() => {
        this.RefreshFileList()
        this.$notify({
          title: 'Success',
          message: '删除成功！',
          type: 'success',
          duration: 2000
        })
      })
    },
    uploadFileSuccess() {
      this.RefreshFileList()
      this.$notify({
        title: 'Success',
        message: '上传成功成功！',
        type: 'success',
        duration: 2000
      })
    },
    RefreshFileList() {
      getTestingCaseDetail(this.caseId).then(response => {
        this.list = response.data.case_details
        this.caseDetail = response.data
        const index = this.caseDetail.case_details.findIndex(v => v.id === this.caseDetailId)
        this.fileData = this.caseDetail.case_details[index].detail_file
      })
    },
    geturl(row) {
      return process.env.VUE_APP_BASE_API + '/test/cases/file/' + row.id + '/download'
    }
  }
}
</script>
