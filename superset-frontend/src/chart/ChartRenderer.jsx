/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import dompurify from 'dompurify';
import { snakeCase } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { SuperChart } from '@superset-ui/chart';
// import echarts from 'echarts';
import ReactEcharts from 'echarts-for-react';
import { Logger, LOG_ACTIONS_RENDER_CHART } from '../logger/LogUtils';
import { getOption } from '../utils/chartUtils';
// import worldland from '../utils/worldland.json';

const propTypes = {
  annotationData: PropTypes.object,
  actions: PropTypes.object,
  chartId: PropTypes.number.isRequired,
  datasource: PropTypes.object.isRequired,
  initialValues: PropTypes.object,
  formData: PropTypes.object.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
  setControlValue: PropTypes.func,
  vizType: PropTypes.string.isRequired,
  triggerRender: PropTypes.bool,
  // state
  chartAlert: PropTypes.string,
  chartStatus: PropTypes.string,
  queryResponse: PropTypes.object,
  triggerQuery: PropTypes.bool,
  refreshOverlayVisible: PropTypes.bool,
  // dashboard callbacks
  addFilter: PropTypes.func,
  onFilterMenuOpen: PropTypes.func,
  onFilterMenuClose: PropTypes.func,
};

const BLANK = {};

const defaultProps = {
  addFilter: () => BLANK,
  onFilterMenuOpen: () => BLANK,
  onFilterMenuClose: () => BLANK,
  initialValues: BLANK,
  setControlValue() {},
  triggerRender: false,
};

// echarts.registerTheme('my_theme', worldland);

class ChartRenderer extends React.Component {
  constructor(props) {
    super(props);
    this.hasQueryResponseChange = false;

    this.handleAddFilter = this.handleAddFilter.bind(this);
    this.handleRenderSuccess = this.handleRenderSuccess.bind(this);
    this.handleRenderFailure = this.handleRenderFailure.bind(this);
    this.handleSetControlValue = this.handleSetControlValue.bind(this);

    this.hooks = {
      onAddFilter: this.handleAddFilter,
      onError: this.handleRenderFailure,
      setControlValue: this.handleSetControlValue,
      onFilterMenuOpen: this.props.onFilterMenuOpen,
      onFilterMenuClose: this.props.onFilterMenuClose,
    };
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.vizType === 'box_plot_run_comp') {
      return true;
    }

    if (nextProps.vizType === 'box_plot_fin') {
      return true;
    }

    if (nextProps.vizType === 'box_plot_fin_str') {
      return true;
    }

    if (nextProps.vizType === 'box_plot_300_cap') {
      return true;
    }

    if (nextProps.vizType === 'spot_price_histogram') {
      return true;
    }

    const resultsReady =
      nextProps.queryResponse &&
      ['success', 'rendered'].indexOf(nextProps.chartStatus) > -1 &&
      !nextProps.queryResponse.error &&
      !nextProps.refreshOverlayVisible;

    if (resultsReady) {
      this.hasQueryResponseChange =
        nextProps.queryResponse !== this.props.queryResponse;

      if (
        this.hasQueryResponseChange ||
        nextProps.annotationData !== this.props.annotationData ||
        nextProps.height !== this.props.height ||
        nextProps.width !== this.props.width ||
        nextProps.triggerRender ||
        nextProps.formData.color_scheme !== this.props.formData.color_scheme ||
        nextProps.cacheBusterProp !== this.props.cacheBusterProp
      ) {
        return true;
      }
    }
    return false;
  }

  handleAddFilter(col, vals, merge = true, refresh = true) {
    this.props.addFilter(col, vals, merge, refresh);
  }

  handleRenderSuccess() {
    const { actions, chartStatus, chartId, vizType } = this.props;
    if (['loading', 'rendered'].indexOf(chartStatus) < 0) {
      actions.chartRenderingSucceeded(chartId);
    }

    // only log chart render time which is triggered by query results change
    // currently we don't log chart re-render time, like window resize etc
    if (this.hasQueryResponseChange) {
      actions.logEvent(LOG_ACTIONS_RENDER_CHART, {
        slice_id: chartId,
        viz_type: vizType,
        start_offset: this.renderStartTime,
        ts: new Date().getTime(),
        duration: Logger.getTimestamp() - this.renderStartTime,
      });
    }
  }

  handleRenderFailure(error, info) {
    const { actions, chartId } = this.props;
    console.warn(error); // eslint-disable-line
    actions.chartRenderingFailed(
      error.toString(),
      chartId,
      info ? info.componentStack : null,
    );

    // only trigger render log when query is changed
    if (this.hasQueryResponseChange) {
      actions.logEvent(LOG_ACTIONS_RENDER_CHART, {
        slice_id: chartId,
        has_err: true,
        error_details: error.toString(),
        start_offset: this.renderStartTime,
        ts: new Date().getTime(),
        duration: Logger.getTimestamp() - this.renderStartTime,
      });
    }
  }

  handleSetControlValue(...args) {
    const { setControlValue } = this.props;
    if (setControlValue) {
      setControlValue(...args);
    }
  }

  render() {
    const {
      chartAlert,
      chartStatus,
      vizType,
      chartId,
      refreshOverlayVisible,
    } = this.props;

    // Skip chart rendering
    if (
      refreshOverlayVisible ||
      chartStatus === 'loading' ||
      !!chartAlert ||
      chartStatus === null
    ) {
      return null;
    }

    this.renderStartTime = Logger.getTimestamp();

    const {
      width,
      height,
      annotationData,
      datasource,
      initialValues,
      formData,
      queryResponse,
    } = this.props;

    // It's bad practice to use unprefixed `vizType` as classnames for chart
    // container. It may cause css conflicts as in the case of legacy table chart.
    // When migrating charts, we should gradually add a `superset-chart-` prefix
    // to each one of them.
    const snakeCaseVizType = snakeCase(vizType);
    const chartClassName =
      vizType === 'table'
        ? `superset-chart-${snakeCaseVizType}`
        : snakeCaseVizType;

    // Change the Y-axis label for different charts
    const fd = { ...formData };
    if (formData.viz_type === 'box_plot_run_comp') {
      if (formData.data_type_picker === 'ForwardPrice') {
        fd.metrics = ['Forward Price ($/MWh)'];
      } else if (formData.data_type_picker === 'SpotPrice') {
        fd.metrics = ['Spot Price ($/MWh)'];
      } else if (formData.data_type_picker === 'LGCPrice') {
        fd.metrics = ['LGC Forward Price ($/certificate)'];
      } else {
        fd.metrics = [formData.data_type_picker];
      }
    }
    if (formData.viz_type === 'box_plot_fin') {
      fd.metrics = [formData.fin_metric_picker];
    }
    if (formData.viz_type === 'box_plot_fin_str') {
      if (formData.fin_str_metric_picker.includes('ROI')) {
        fd.metrics = ['%'];
      } else {
        fd.metrics = ['$'];
      }
    }    
    // console.log(JSON.stringify(queryResponse.data));
    return (
      <>
        {formData.viz_type === 'box_plot_300_cap' ||
        formData.viz_type === 'spot_price_histogram' ? (
          <ReactEcharts
            key={`${chartId}${
              process.env.WEBPACK_MODE === 'development' ? `-${Date.now()}` : ''
            }`}
            id={`chart-id-${chartId}`}
            option={getOption(queryResponse)}
            style={{ height: `${height}px`, width: `${width}px` }}
            theme="light"
          />
        ) : (
          <SuperChart
            disableErrorBoundary
            key={`${chartId}${
              process.env.WEBPACK_MODE === 'development' ? `-${Date.now()}` : ''
            }`}
            id={`chart-id-${chartId}`}
            className={chartClassName}
            chartType={vizType}
            width={width}
            height={height}
            annotationData={annotationData}
            datasource={datasource}
            initialValues={initialValues}
            formData={fd}
            hooks={this.hooks}
            queryData={queryResponse}
            onRenderSuccess={this.handleRenderSuccess}
            onRenderFailure={this.handleRenderFailure}
          />
        )}
      </>
    );
  }
}

ChartRenderer.propTypes = propTypes;
ChartRenderer.defaultProps = defaultProps;

export default ChartRenderer;
